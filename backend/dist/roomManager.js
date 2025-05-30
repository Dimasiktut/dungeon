import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ServerMessageType, TurnPhase, sanitizeRoomForClient, sanitizePlayerForClient, sanitizeGameStateForClient } from './types.js'; // Backend types
// Removed imports from gameLogic as they are not used here and gameLogic sources from gameData
// In-memory store for active rooms
const activeRooms = new Map();
export function getRoom(roomId) {
    return activeRooms.get(roomId);
}
export function findRoomByPlayerId(playerId) {
    for (const room of activeRooms.values()) {
        if (room.players.some(p => p.id === playerId)) {
            return room;
        }
    }
    return undefined;
}
export function broadcastToRoom(roomId, message, excludePlayerId) {
    const room = activeRooms.get(roomId);
    if (!room)
        return;
    const messageString = JSON.stringify(message);
    room.players.forEach(player => {
        if (player.id !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(messageString);
        }
    });
}
export function handleCreateRoom(ws, payload) {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    const hostId = ws.clientId;
    const hostPlayer = {
        id: hostId,
        name: payload.playerName || `Host ${hostId.slice(0, 4)}`,
        avatarUrl: `https://picsum.photos/seed/${hostId}/100/100`,
        level: payload.startingLevel,
        gear: 0,
        equippedItems: [],
        cardsInHand: [],
        isHost: true,
        ws: ws
    };
    const newRoom = {
        id: roomId,
        settings: {
            roomName: payload.roomName,
            password: payload.password,
            maxPlayers: payload.maxPlayers,
            extraDecks: payload.extraDecks,
            startingLevel: payload.startingLevel,
        },
        players: [hostPlayer],
        chatMessages: [],
        gameState: null,
        hostId: hostId,
    };
    activeRooms.set(roomId, newRoom);
    console.log(`Room ${roomId} created by ${hostPlayer.name} (ID: ${hostId})`);
    ws.send(JSON.stringify({
        type: ServerMessageType.ROOM_CREATED,
        payload: { room: sanitizeRoomForClient(newRoom), localPlayerId: hostId }
    }));
}
export function handleJoinRoom(ws, payload) {
    const room = activeRooms.get(payload.roomId);
    const playerId = ws.clientId;
    if (!room) {
        ws.send(JSON.stringify({ type: ServerMessageType.ERROR, payload: { message: "Room not found." } }));
        return;
    }
    if (room.gameState && room.gameState.isGameStarted) {
        ws.send(JSON.stringify({ type: ServerMessageType.ERROR, payload: { message: "Cannot join a game that has already started." } }));
        return;
    }
    if (room.players.length >= room.settings.maxPlayers) {
        ws.send(JSON.stringify({ type: ServerMessageType.ERROR, payload: { message: "Room is full." } }));
        return;
    }
    if (room.players.find(p => p.id === playerId)) {
        ws.send(JSON.stringify({ type: ServerMessageType.ERROR, payload: { message: "You are already in this room." } }));
        return;
    }
    const newPlayer = {
        id: playerId,
        name: payload.playerName || `Player ${playerId.slice(0, 4)}`,
        avatarUrl: `https://picsum.photos/seed/${playerId}/100/100`,
        level: room.settings.startingLevel,
        gear: 0,
        equippedItems: [],
        cardsInHand: [],
        isHost: false,
        ws: ws
    };
    room.players.push(newPlayer);
    console.log(`Player ${newPlayer.name} (ID: ${playerId}) joined room ${room.id}`);
    ws.send(JSON.stringify({
        type: ServerMessageType.ROOM_JOINED,
        payload: { room: sanitizeRoomForClient(room), localPlayerId: playerId }
    }));
    broadcastToRoom(room.id, {
        type: ServerMessageType.PLAYER_JOINED_ROOM,
        payload: { player: sanitizePlayerForClient(newPlayer), room: sanitizeRoomForClient(room) }
    }, playerId);
}
export function handleDisconnect(ws) {
    const playerId = ws.clientId;
    if (!playerId)
        return;
    activeRooms.forEach((room) => {
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex > -1) {
            const disconnectedPlayer = room.players.splice(playerIndex, 1)[0];
            console.log(`Player ${disconnectedPlayer.name} (ID: ${playerId}) disconnected from room ${room.id}`);
            const systemMessage = {
                id: uuidv4(),
                roomId: room.id,
                playerId: 'system',
                playerName: 'System',
                text: `${disconnectedPlayer.name} has left the adventure.`,
                timestamp: new Date(),
            };
            room.chatMessages.push(systemMessage);
            if (room.chatMessages.length > 50)
                room.chatMessages.shift();
            broadcastToRoom(room.id, {
                type: ServerMessageType.PLAYER_LEFT_ROOM,
                payload: { playerId: disconnectedPlayer.id, room: sanitizeRoomForClient(room) }
            });
            broadcastToRoom(room.id, {
                type: ServerMessageType.CHAT_MESSAGE_BROADCAST,
                payload: systemMessage
            });
            if (room.players.length === 0) {
                if (!room.gameState || !room.gameState.isGameStarted) {
                    activeRooms.delete(room.id);
                    console.log(`Room ${room.id} is empty and was not in an active game. Deleted.`);
                    return;
                }
            }
            if (disconnectedPlayer.isHost && room.players.length > 0) {
                room.players[0].isHost = true;
                room.hostId = room.players[0].id;
                console.log(`New host for room ${room.id} is ${room.players[0].name}`);
            }
            if (room.gameState && room.gameState.isGameStarted) {
                const gs = room.gameState;
                const disconnectedPlayerInGameIndex = gs.players.findIndex(p => p.id === playerId);
                if (disconnectedPlayerInGameIndex !== -1) {
                    gs.players.splice(disconnectedPlayerInGameIndex, 1);
                }
                if (gs.players.length === 0) {
                    addLogEntry(gs, `${disconnectedPlayer.name} disconnected. No players left. Game ended.`);
                    gs.isGameStarted = false;
                    gs.currentPlayerId = null;
                    activeRooms.delete(room.id);
                    console.log(`Room ${room.id} game ended and room deleted due to no players.`);
                }
                else if (gs.currentPlayerId === playerId) {
                    // Current player disconnected, advance turn
                    let newPlayerForTurn = undefined;
                    if (room.hostId) { // Attempt to set new host as current player if they are in game
                        newPlayerForTurn = gs.players.find(p => p.id === room.hostId);
                    }
                    if (!newPlayerForTurn && gs.players.length > 0) { // Fallback to first player in game list
                        newPlayerForTurn = gs.players[0];
                    }
                    if (newPlayerForTurn) {
                        gs.currentPlayerId = newPlayerForTurn.id;
                        gs.turnPhase = TurnPhase.KickOpenDoor;
                        addLogEntry(gs, `${disconnectedPlayer.name} disconnected. It's now ${newPlayerForTurn.name}'s turn.`);
                    }
                    else {
                        // This state implies gs.players became empty unexpectedly or logic error
                        addLogEntry(gs, `${disconnectedPlayer.name} disconnected. Error: No valid next player found. Game may be stuck.`);
                        gs.currentPlayerId = null; // Or handle game ending more formally
                    }
                }
                else {
                    addLogEntry(gs, `${disconnectedPlayer.name} disconnected from the game.`);
                }
                broadcastToRoom(room.id, {
                    type: ServerMessageType.GAME_STATE_UPDATE,
                    payload: { gameState: sanitizeGameStateForClient(gs), roomId: room.id }
                });
            }
            else if (room.players.length === 0) {
                // If game wasn't started and room is now empty (this path is hit if the first 'return' condition wasn't met)
                activeRooms.delete(room.id);
                console.log(`Room ${room.id} is empty (game not started) and has been deleted.`);
            }
        }
    });
}
function addLogEntry(gameState, message) {
    if (!gameState)
        return;
    gameState.log.push(message);
    if (gameState.log.length > 20)
        gameState.log.shift();
}
export function addChatMessageToRoom(roomId, player, text) {
    const room = activeRooms.get(roomId);
    if (!room)
        return;
    const message = {
        id: uuidv4(),
        roomId: room.id,
        playerId: player.id,
        playerName: player.name,
        text: text,
        timestamp: new Date(),
    };
    room.chatMessages.push(message);
    if (room.chatMessages.length > 50) {
        room.chatMessages.shift();
    }
    broadcastToRoom(roomId, {
        type: ServerMessageType.CHAT_MESSAGE_BROADCAST,
        payload: message
    });
}
export { sanitizeRoomForClient };
