"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const types_1 = require("./types");
const roomManager_1 = require("./roomManager");
const gameLogic_1 = require("./gameLogic");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
// ✅ Преобразуем порт в число
const PORT = Number(process.env.PORT) || 8080;
wss.on('connection', (ws) => {
    const clientId = (0, uuid_1.v4)();
    console.log(`Клиент ${clientId} подключился`);
    ws.clientId = clientId;
    ws.on('message', (message) => {
        try {
            const clientMessage = JSON.parse(message);
            console.log(`Получено сообщение от ${clientId}:`, clientMessage);
            clientMessage.playerId = clientId;
            switch (clientMessage.type) {
                case types_1.ClientMessageType.CREATE_ROOM:
                    (0, roomManager_1.handleCreateRoom)(ws, clientMessage.payload);
                    break;
                case types_1.ClientMessageType.JOIN_ROOM:
                    (0, roomManager_1.handleJoinRoom)(ws, clientMessage.payload);
                    break;
                case types_1.ClientMessageType.SEND_CHAT_MESSAGE: {
                    const room = clientMessage.roomId ? (0, roomManager_1.getRoom)(clientMessage.roomId) : null;
                    const player = room?.players.find(p => p.id === clientMessage.playerId);
                    if (room && player) {
                        const chatPayload = clientMessage.payload;
                        (0, roomManager_1.addChatMessageToRoom)(room.id, player, chatPayload.text);
                    }
                    else {
                        ws.send(JSON.stringify({
                            type: types_1.ServerMessageType.ERROR,
                            payload: { message: "Комната или игрок не найдены для чата." }
                        }));
                    }
                    break;
                }
                case types_1.ClientMessageType.START_GAME:
                    (0, gameLogic_1.handleStartGame)(clientMessage.roomId, clientMessage.playerId);
                    break;
                case types_1.ClientMessageType.KICK_OPEN_DOOR:
                    (0, gameLogic_1.handleKickOpenDoor)(clientMessage.roomId, clientMessage.playerId);
                    break;
                case types_1.ClientMessageType.RESOLVE_DOOR_CARD: {
                    const payload = clientMessage.payload;
                    if (payload.resolutionAction) {
                        (0, gameLogic_1.handleResolveDoorCard)(clientMessage.roomId, clientMessage.playerId, payload.resolutionAction);
                    }
                    break;
                }
                case types_1.ClientMessageType.PLAY_CARD_FROM_HAND: {
                    const payload = clientMessage.payload;
                    if (payload.cardId) {
                        (0, gameLogic_1.handlePlayCardFromHand)(clientMessage.roomId, clientMessage.playerId, payload.cardId);
                    }
                    break;
                }
                case types_1.ClientMessageType.END_TURN:
                    (0, gameLogic_1.handleEndTurn)(clientMessage.roomId, clientMessage.playerId);
                    break;
                case types_1.ClientMessageType.LOOT_ROOM:
                    (0, gameLogic_1.handleLootRoom)(clientMessage.roomId, clientMessage.playerId);
                    break;
                default:
                    console.warn(`Неизвестный тип сообщения: ${clientMessage.type}`);
                    ws.send(JSON.stringify({
                        type: types_1.ServerMessageType.ERROR,
                        payload: { message: `Неизвестный тип сообщения: ${clientMessage.type}` }
                    }));
            }
        }
        catch (error) {
            console.error('Ошибка обработки сообщения:', message, error);
            ws.send(JSON.stringify({
                type: types_1.ServerMessageType.ERROR,
                payload: { message: "Неверный формат сообщения." }
            }));
        }
    });
    ws.on('close', () => {
        console.log(`Клиент ${clientId} отключился`);
        (0, roomManager_1.handleDisconnect)(ws);
    });
    ws.on('error', (error) => {
        console.error(`Ошибка WebSocket у клиента ${clientId}:`, error);
    });
    ws.send(JSON.stringify({
        type: types_1.ServerMessageType.NOTIFICATION,
        payload: {
            message: `Подключено к серверу. Ваш ID: ${clientId}`,
            level: 'info'
        }
    }));
});
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер Dungeon Delvers Online запущен на порту ${PORT}`);
});
