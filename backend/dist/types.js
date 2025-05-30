"use strict";
// This file would ideally share types with the frontend.
// For this exercise, we'll re-declare or adapt necessary types.
// In a monorepo, you'd share a 'common' types package.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRoomForClient = exports.sanitizeGameStateForClient = exports.sanitizePlayerForClient = exports.ServerMessageType = exports.ClientMessageType = exports.CardType = exports.TurnPhase = void 0;
// --- Copied/Adapted from frontend/types.ts ---
var TurnPhase;
(function (TurnPhase) {
    TurnPhase["KickOpenDoor"] = "KickOpenDoor";
    TurnPhase["ResolveDoorCard"] = "ResolveDoorCard";
    TurnPhase["Combat"] = "Combat";
    TurnPhase["LootTheRoom"] = "LootTheRoom";
    TurnPhase["LookingForTrouble"] = "LookingForTrouble";
    TurnPhase["Charity"] = "Charity";
    TurnPhase["TurnEnd"] = "TurnEnd";
})(TurnPhase = exports.TurnPhase || (exports.TurnPhase = {}));
var CardType;
(function (CardType) {
    CardType["Door"] = "Door";
    CardType["Treasure"] = "Treasure";
    CardType["Monster"] = "Monster";
    CardType["Curse"] = "Curse";
    CardType["Item"] = "Item";
    CardType["Class"] = "Class";
    CardType["Race"] = "Race";
    CardType["OneShot"] = "OneShot";
    CardType["MonsterEnhancer"] = "MonsterEnhancer";
    CardType["SpecialDoor"] = "SpecialDoor";
})(CardType = exports.CardType || (exports.CardType = {}));
// --- WebSocket Message Types (Mirrors frontend for consistency) ---
var ClientMessageType;
(function (ClientMessageType) {
    ClientMessageType["CREATE_ROOM"] = "CREATE_ROOM";
    ClientMessageType["JOIN_ROOM"] = "JOIN_ROOM";
    ClientMessageType["SEND_CHAT_MESSAGE"] = "SEND_CHAT_MESSAGE";
    ClientMessageType["START_GAME"] = "START_GAME";
    ClientMessageType["PLAYER_ACTION"] = "PLAYER_ACTION";
    ClientMessageType["KICK_OPEN_DOOR"] = "KICK_OPEN_DOOR";
    ClientMessageType["RESOLVE_DOOR_CARD"] = "RESOLVE_DOOR_CARD";
    ClientMessageType["PLAY_CARD_FROM_HAND"] = "PLAY_CARD_FROM_HAND";
    ClientMessageType["END_TURN"] = "END_TURN";
    ClientMessageType["LOOT_ROOM"] = "LOOT_ROOM";
})(ClientMessageType = exports.ClientMessageType || (exports.ClientMessageType = {}));
var ServerMessageType;
(function (ServerMessageType) {
    ServerMessageType["ERROR"] = "ERROR";
    ServerMessageType["ROOM_CREATED"] = "ROOM_CREATED";
    ServerMessageType["ROOM_JOINED"] = "ROOM_JOINED";
    ServerMessageType["PLAYER_JOINED_ROOM"] = "PLAYER_JOINED_ROOM";
    ServerMessageType["PLAYER_LEFT_ROOM"] = "PLAYER_LEFT_ROOM";
    ServerMessageType["ROOM_UPDATE"] = "ROOM_UPDATE";
    ServerMessageType["CHAT_MESSAGE_BROADCAST"] = "CHAT_MESSAGE_BROADCAST";
    ServerMessageType["GAME_STARTED"] = "GAME_STARTED";
    ServerMessageType["GAME_STATE_UPDATE"] = "GAME_STATE_UPDATE";
    ServerMessageType["NOTIFICATION"] = "NOTIFICATION";
})(ServerMessageType = exports.ServerMessageType || (exports.ServerMessageType = {}));
// --- Sanitization Helper Functions ---
function sanitizePlayerForClient(player) {
    const { ws, ...clientSafePlayer } = player;
    return clientSafePlayer;
}
exports.sanitizePlayerForClient = sanitizePlayerForClient;
function sanitizeGameStateForClient(gameState) {
    return {
        ...gameState,
        players: gameState.players.map(sanitizePlayerForClient),
    };
}
exports.sanitizeGameStateForClient = sanitizeGameStateForClient;
function sanitizeRoomForClient(room) {
    return {
        ...room,
        players: room.players.map(sanitizePlayerForClient),
        gameState: room.gameState ? sanitizeGameStateForClient(room.gameState) : null,
    };
}
exports.sanitizeRoomForClient = sanitizeRoomForClient;
