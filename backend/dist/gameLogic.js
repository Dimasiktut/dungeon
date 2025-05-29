"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEndTurn = exports.handlePlayCardFromHand = exports.handleLootRoom = exports.handleResolveDoorCard = exports.handleKickOpenDoor = exports.handleStartGame = void 0;
const types_1 = require("./types"); // Backend types
const roomManager_1 = require("./roomManager");
const gameData_1 = require("./gameData"); // Import from gameData.ts
// --- Game Logic Functions ---
function shuffleDeck(deck) {
    const shuffled = [...deck]; // Create a new array from the initial deck
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function handleStartGame(roomId, playerId) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room) {
        console.error(`StartGame: Room ${roomId} not found.`);
        return;
    }
    if (room.hostId !== playerId) {
        const player = room.players.find(p => p.id === playerId);
        if (player)
            player.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Only the host can start the game." } }));
        return;
    }
    if (room.players.length < gameData_1.MIN_PLAYERS_TO_START) {
        const player = room.players.find(p => p.id === playerId);
        if (player)
            player.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: `Need at least ${gameData_1.MIN_PLAYERS_TO_START} players.` } }));
        return;
    }
    if (room.gameState && room.gameState.isGameStarted) {
        const player = room.players.find(p => p.id === playerId);
        if (player)
            player.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Game already in progress." } }));
        return;
    }
    // Use copies of the imported initial decks for shuffling
    const shuffledDoorDeck = shuffleDeck([...gameData_1.MOCK_DOOR_DECK]);
    const shuffledTreasureDeck = shuffleDeck([...gameData_1.MOCK_TREASURE_DECK]);
    const gamePlayers = room.players.map(p => {
        const hand = [];
        for (let i = 0; i < gameData_1.INITIAL_PLAYER_CARDS_HAND_SIZE / 2; i++) {
            if (shuffledDoorDeck.length > 0)
                hand.push(shuffledDoorDeck.pop());
            if (shuffledTreasureDeck.length > 0)
                hand.push(shuffledTreasureDeck.pop());
        }
        return {
            ...p,
            level: room.settings.startingLevel,
            gear: 0,
            equippedItems: [],
            cardsInHand: hand,
        };
    });
    room.gameState = {
        roomId: room.id,
        players: gamePlayers,
        currentPlayerId: gamePlayers[0].id,
        doorDeck: shuffledDoorDeck,
        treasureDeck: shuffledTreasureDeck,
        doorDiscard: [],
        treasureDiscard: [],
        turnPhase: types_1.TurnPhase.KickOpenDoor,
        currentEncounterCard: null,
        activeMonster: null,
        log: [`Game started in room "${room.settings.roomName}"!`, `${gamePlayers[0].name}'s turn. Kick open a door!`],
        isGameStarted: true,
    };
    console.log(`Game started in room ${roomId}. Current player: ${room.gameState.currentPlayerId}`);
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STARTED,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(room.gameState), roomId: room.id }
    });
}
exports.handleStartGame = handleStartGame;
function addLogEntry(gameState, message) {
    gameState.log.push(message);
    if (gameState.log.length > 20)
        gameState.log.shift();
}
function handleKickOpenDoor(roomId, playerId) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room || !room.gameState || !room.gameState.isGameStarted)
        return;
    const gs = room.gameState;
    if (gs.currentPlayerId !== playerId || gs.turnPhase !== types_1.TurnPhase.KickOpenDoor) {
        const player = room.players.find(p => p.id === playerId);
        if (player)
            player.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Not your turn or wrong game phase." } }));
        return;
    }
    if (gs.doorDeck.length === 0) {
        // Reshuffle discard pile if deck is empty
        if (gs.doorDiscard.length > 0) {
            addLogEntry(gs, "Door deck empty. Reshuffling discard pile...");
            gs.doorDeck = shuffleDeck(gs.doorDiscard);
            gs.doorDiscard = [];
        }
        else {
            addLogEntry(gs, "Door deck and discard are empty! No cards to draw.");
            gs.turnPhase = types_1.TurnPhase.LookingForTrouble;
            (0, roomManager_1.broadcastToRoom)(roomId, {
                type: types_1.ServerMessageType.GAME_STATE_UPDATE,
                payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
            });
            return;
        }
    }
    const drawnCard = gs.doorDeck.pop();
    gs.currentEncounterCard = drawnCard;
    gs.turnPhase = types_1.TurnPhase.ResolveDoorCard;
    const playerName = gs.players.find(p => p.id === playerId)?.name || 'Player';
    addLogEntry(gs, `${playerName} kicks open the door and finds: ${drawnCard.name}!`);
    addLogEntry(gs, `Resolve the encounter: ${drawnCard.name}.`);
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STATE_UPDATE,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
    });
}
exports.handleKickOpenDoor = handleKickOpenDoor;
function handleResolveDoorCard(roomId, playerId, action) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room || !room.gameState || !room.gameState.isGameStarted)
        return;
    const gs = room.gameState;
    const player = gs.players.find(p => p.id === playerId);
    if (!player || gs.currentPlayerId !== playerId || gs.turnPhase !== types_1.TurnPhase.ResolveDoorCard || !gs.currentEncounterCard) {
        const requestingPlayer = room.players.find(p => p.id === playerId);
        if (requestingPlayer)
            requestingPlayer.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Cannot resolve card now." } }));
        return;
    }
    const encounterCard = gs.currentEncounterCard;
    let nextPhase = types_1.TurnPhase.LookingForTrouble;
    switch (encounterCard.type) {
        case types_1.CardType.Monster:
            if (action === 'fightMonster') {
                addLogEntry(gs, `${player.name} decides to fight ${encounterCard.name}!`);
                gs.activeMonster = encounterCard;
                // Simplified combat: auto-win for now
                addLogEntry(gs, `${encounterCard.name} is defeated (auto-win)! Time to loot.`);
                nextPhase = types_1.TurnPhase.LootTheRoom;
            }
            else {
                addLogEntry(gs, `Invalid action for Monster encounter.`);
                // Send error to player? Or just don't change state.
                return;
            }
            break;
        case types_1.CardType.Curse:
            if (action === 'applyCurse') {
                addLogEntry(gs, `${player.name} is hit by ${encounterCard.name}! ${encounterCard.badStuff || 'Bad stuff happens.'}`);
                // Simplified curse effect: If name contains "level" and player level > 1, lose level.
                if (encounterCard.name.toLowerCase().includes("level") && player.level > 1) {
                    player.level -= 1;
                    addLogEntry(gs, `${player.name} loses a level!`);
                }
                // Add other specific curse effects here based on card.name or card.id
                gs.doorDiscard.push(encounterCard);
                nextPhase = types_1.TurnPhase.LookingForTrouble;
            }
            else {
                addLogEntry(gs, `Invalid action for Curse encounter.`);
                return;
            }
            break;
        default: // Class, Race, SpecialDoor (some items might appear from doors in some rule sets)
            if (action === 'takeToHand') {
                player.cardsInHand.push(encounterCard);
                addLogEntry(gs, `${player.name} takes ${encounterCard.name} into hand.`);
                nextPhase = types_1.TurnPhase.LookingForTrouble;
            }
            else if (action === 'playImmediately') {
                // This would require more complex logic to determine if the card *can* be played immediately
                // For now, treat as "take to hand"
                player.cardsInHand.push(encounterCard);
                addLogEntry(gs, `${player.name} takes ${encounterCard.name} into hand (playImmediately not fully implemented).`);
                nextPhase = types_1.TurnPhase.LookingForTrouble;
            }
            else {
                addLogEntry(gs, `Invalid action for ${encounterCard.type} encounter.`);
                return;
            }
            break;
    }
    gs.currentEncounterCard = null;
    gs.turnPhase = nextPhase;
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STATE_UPDATE,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
    });
}
exports.handleResolveDoorCard = handleResolveDoorCard;
function handleLootRoom(roomId, playerId) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room || !room.gameState || !room.gameState.isGameStarted)
        return;
    const gs = room.gameState;
    const player = gs.players.find(p => p.id === playerId);
    if (!player || gs.currentPlayerId !== playerId || gs.turnPhase !== types_1.TurnPhase.LootTheRoom) {
        const requestingPlayer = room.players.find(p => p.id === playerId);
        if (requestingPlayer)
            requestingPlayer.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Cannot loot now." } }));
        return;
    }
    const treasuresToDraw = gs.activeMonster?.treasures || 1; // Default to 1 if no monster or monster has 0 treasures
    addLogEntry(gs, `${player.name} loots the room for ${treasuresToDraw} treasure(s).`);
    for (let i = 0; i < treasuresToDraw; i++) {
        if (gs.treasureDeck.length === 0) {
            if (gs.treasureDiscard.length > 0) {
                addLogEntry(gs, "Treasure deck empty. Reshuffling discard pile...");
                gs.treasureDeck = shuffleDeck(gs.treasureDiscard);
                gs.treasureDiscard = [];
            }
            else {
                addLogEntry(gs, "Treasure deck and discard are empty! No treasures to draw.");
                break;
            }
        }
        if (gs.treasureDeck.length > 0) { // Check again after potential reshuffle
            const treasureCard = gs.treasureDeck.pop();
            player.cardsInHand.push(treasureCard);
            addLogEntry(gs, `Drew ${treasureCard.name}.`);
        }
    }
    if (gs.activeMonster) {
        gs.doorDiscard.push(gs.activeMonster); // Monster goes to door discard
        gs.activeMonster = null;
    }
    gs.turnPhase = types_1.TurnPhase.LookingForTrouble;
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STATE_UPDATE,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
    });
}
exports.handleLootRoom = handleLootRoom;
function handlePlayCardFromHand(roomId, playerId, cardId) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room || !room.gameState || !room.gameState.isGameStarted)
        return;
    const gs = room.gameState;
    const player = gs.players.find(p => p.id === playerId);
    if (!player || gs.currentPlayerId !== playerId) {
        const requestingPlayer = room.players.find(p => p.id === playerId);
        if (requestingPlayer)
            requestingPlayer.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Cannot play card now (not your turn)." } }));
        return;
    }
    // Allow playing cards during more phases, server can validate specific card types if needed
    if (![types_1.TurnPhase.LookingForTrouble, types_1.TurnPhase.KickOpenDoor, types_1.TurnPhase.ResolveDoorCard, types_1.TurnPhase.Combat, types_1.TurnPhase.Charity, types_1.TurnPhase.LootTheRoom].includes(gs.turnPhase)) {
        const requestingPlayer = room.players.find(p => p.id === playerId);
        if (requestingPlayer)
            requestingPlayer.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Cannot play cards at this time (invalid phase)." } }));
        return;
    }
    const cardIndex = player.cardsInHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
        addLogEntry(gs, `Error: ${player.name} tried to play a card not in hand.`);
        (0, roomManager_1.broadcastToRoom)(roomId, { type: types_1.ServerMessageType.GAME_STATE_UPDATE, payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id } });
        return;
    }
    const cardToPlay = player.cardsInHand.splice(cardIndex, 1)[0];
    // Basic logic for playing cards
    if (cardToPlay.type === types_1.CardType.Item) {
        // Simple equip logic: no slot restrictions for now
        player.equippedItems.push(cardToPlay);
        player.gear = (0, gameData_1.calculateGear)(player.equippedItems);
        addLogEntry(gs, `${player.name} equips ${cardToPlay.name} (+${cardToPlay.bonus || 0} gear).`);
    }
    else if (cardToPlay.name.toLowerCase().includes("gain a level") && cardToPlay.type === types_1.CardType.OneShot) {
        if (player.level < 9) { // Max level typically 10, win at 10
            player.level += 1;
            addLogEntry(gs, `${player.name} uses ${cardToPlay.name} and gains a level! Now level ${player.level}.`);
        }
        else {
            addLogEntry(gs, `${player.name} tries to use ${cardToPlay.name} but is already max level (or winning level).`);
            player.cardsInHand.push(cardToPlay); // Return to hand if not usable
        }
        gs.treasureDiscard.push(cardToPlay); // OneShot cards are usually Treasures
    }
    else if (cardToPlay.type === types_1.CardType.OneShot) {
        addLogEntry(gs, `${player.name} uses ${cardToPlay.name}! (Effect simulated for now)`);
        gs.treasureDiscard.push(cardToPlay);
    }
    else if (cardToPlay.type === types_1.CardType.Class || cardToPlay.type === types_1.CardType.Race) {
        // Player can only have one Class/Race at a time (simplified)
        // Discard existing class/race of same type if any
        const existingCardIndex = player.equippedItems.findIndex(c => c.type === cardToPlay.type);
        if (existingCardIndex !== -1) {
            const removedCard = player.equippedItems.splice(existingCardIndex, 1)[0];
            if (removedCard.type === types_1.CardType.Class || removedCard.type === types_1.CardType.Race) { // Should always be true
                gs.doorDiscard.push(removedCard);
            }
            addLogEntry(gs, `${player.name} discards previous ${removedCard.type} (${removedCard.name}).`);
        }
        player.equippedItems.push(cardToPlay); // Classes/Races are "equipped" for their effects
        addLogEntry(gs, `${player.name} becomes a ${cardToPlay.name}!`);
        // Note: Classes/Races are Door cards, but when played from hand they don't go to treasure discard.
        // They are "in play". If replaced, then they go to door discard.
    }
    else {
        addLogEntry(gs, `${player.name} tries to play ${cardToPlay.name}, but this action is not fully supported. Card returned to hand.`);
        player.cardsInHand.push(cardToPlay);
    }
    player.gear = (0, gameData_1.calculateGear)(player.equippedItems); // Recalculate gear after any change
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STATE_UPDATE,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
    });
}
exports.handlePlayCardFromHand = handlePlayCardFromHand;
function handleEndTurn(roomId, playerId) {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room || !room.gameState || !room.gameState.isGameStarted)
        return;
    const gs = room.gameState;
    const player = gs.players.find(p => p.id === playerId);
    if (!player || gs.currentPlayerId !== playerId) {
        const requestingPlayer = room.players.find(p => p.id === playerId);
        if (requestingPlayer)
            requestingPlayer.ws.send(JSON.stringify({ type: types_1.ServerMessageType.ERROR, payload: { message: "Cannot end turn now." } }));
        return;
    }
    // Charity Phase
    if (player.cardsInHand.length > gameData_1.MAX_CARDS_IN_HAND) {
        addLogEntry(gs, `${player.name} has ${player.cardsInHand.length} cards, performing Charity (discarding oldest).`);
        while (player.cardsInHand.length > gameData_1.MAX_CARDS_IN_HAND) {
            const discardedCard = player.cardsInHand.shift(); // Discard oldest for simplicity
            if ([types_1.CardType.Item, types_1.CardType.OneShot, types_1.CardType.Treasure].includes(discardedCard.type)) {
                gs.treasureDiscard.push(discardedCard);
            }
            else {
                gs.doorDiscard.push(discardedCard);
            }
            addLogEntry(gs, `${player.name} discards ${discardedCard.name} for Charity.`);
        }
    }
    // Check for win condition
    if (player.level >= 10) {
        addLogEntry(gs, `${player.name} has reached level 10 and WINS THE GAME!!!`);
        gs.isGameStarted = false; // End the game
        // Future: more elaborate game end sequence
        (0, roomManager_1.broadcastToRoom)(roomId, {
            type: types_1.ServerMessageType.NOTIFICATION,
            payload: { message: `${player.name} wins the game! Congratulations!`, level: 'info' }
        });
        (0, roomManager_1.broadcastToRoom)(roomId, {
            type: types_1.ServerMessageType.GAME_STATE_UPDATE,
            payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
        });
        return; // Stop further turn progression
    }
    const currentPlayerIndex = gs.players.findIndex(p => p.id === gs.currentPlayerId);
    let nextPlayerIndex = (currentPlayerIndex + 1) % gs.players.length;
    // Ensure the next player is still connected (relevant if a player disconnected mid-game and wasn't filtered out of gs.players properly)
    // gs.players should already be filtered by handleDisconnect if a player left.
    if (gs.players.length === 0) {
        addLogEntry(gs, `No players left in the game.`);
        gs.isGameStarted = false;
        (0, roomManager_1.broadcastToRoom)(roomId, { type: types_1.ServerMessageType.GAME_STATE_UPDATE, payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id } });
        return;
    }
    if (nextPlayerIndex >= gs.players.length)
        nextPlayerIndex = 0; // Should not happen if modulus is correct and players exist
    const nextPlayer = gs.players[nextPlayerIndex];
    if (!nextPlayer) { // Should not happen if gs.players is not empty
        addLogEntry(gs, `Error: Could not determine next player. Game may be stuck.`);
        (0, roomManager_1.broadcastToRoom)(roomId, { type: types_1.ServerMessageType.GAME_STATE_UPDATE, payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id } });
        return;
    }
    gs.currentPlayerId = nextPlayer.id;
    gs.turnPhase = types_1.TurnPhase.KickOpenDoor;
    gs.currentEncounterCard = null;
    gs.activeMonster = null;
    addLogEntry(gs, `${player.name} ends their turn. It is now ${nextPlayer.name}'s turn.`);
    addLogEntry(gs, `${nextPlayer.name}, kick open a door!`);
    (0, roomManager_1.broadcastToRoom)(roomId, {
        type: types_1.ServerMessageType.GAME_STATE_UPDATE,
        payload: { gameState: (0, types_1.sanitizeGameStateForClient)(gs), roomId: room.id }
    });
}
exports.handleEndTurn = handleEndTurn;
