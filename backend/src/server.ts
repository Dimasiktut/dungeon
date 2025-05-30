import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ClientMessage, ClientMessageType, ServerMessageType, Player,
  CreateRoomPayload, JoinRoomPayload, SendChatMessagePayload, PlayerActionPayload
} from './types.js';

import {
  handleCreateRoom, handleJoinRoom, handleDisconnect,
  broadcastToRoom, getRoom, sanitizeRoomForClient,
  addChatMessageToRoom, findRoomByPlayerId
} from './roomManager.js';

import {
  handleStartGame, handleKickOpenDoor, handleResolveDoorCard,
  handlePlayCardFromHand, handleEndTurn, handleLootRoom
} from './gameLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 8080;

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  console.log(`Клиент ${clientId} подключился`);

  (ws as any).clientId = clientId;

  ws.on('message', (message: string) => {
    try {
      const clientMessage = JSON.parse(message) as ClientMessage;
      console.log(`Получено сообщение от ${clientId}:`, clientMessage);

      clientMessage.playerId = clientId;

      switch (clientMessage.type) {
        case ClientMessageType.CREATE_ROOM:
          handleCreateRoom(ws, clientMessage.payload as CreateRoomPayload);
          break;
        case ClientMessageType.JOIN_ROOM:
          handleJoinRoom(ws, clientMessage.payload as JoinRoomPayload);
          break;
        case ClientMessageType.SEND_CHAT_MESSAGE: {
          const room = clientMessage.roomId ? getRoom(clientMessage.roomId) : null;
          const player = room?.players.find(p => p.id === clientMessage.playerId);
          if (room && player) {
            const chatPayload = clientMessage.payload as SendChatMessagePayload;
            addChatMessageToRoom(room.id, player, chatPayload.text);
          } else {
            ws.send(JSON.stringify({
              type: ServerMessageType.ERROR,
              payload: { message: "Комната или игрок не найдены для чата." }
            }));
          }
          break;
        }
        case ClientMessageType.START_GAME:
          handleStartGame(clientMessage.roomId!, clientMessage.playerId!);
          break;
        case ClientMessageType.KICK_OPEN_DOOR:
          handleKickOpenDoor(clientMessage.roomId!, clientMessage.playerId!);
          break;
        case ClientMessageType.RESOLVE_DOOR_CARD: {
          const payload = clientMessage.payload as PlayerActionPayload;
          if (payload.resolutionAction) {
            handleResolveDoorCard(clientMessage.roomId!, clientMessage.playerId!, payload.resolutionAction);
          }
          break;
        }
        case ClientMessageType.PLAY_CARD_FROM_HAND: {
          const payload = clientMessage.payload as PlayerActionPayload;
          if (payload.cardId) {
            handlePlayCardFromHand(clientMessage.roomId!, clientMessage.playerId!, payload.cardId);
          }
          break;
        }
        case ClientMessageType.END_TURN:
          handleEndTurn(clientMessage.roomId!, clientMessage.playerId!);
          break;
        case ClientMessageType.LOOT_ROOM:
          handleLootRoom(clientMessage.roomId!, clientMessage.playerId!);
          break;
        default:
          console.warn(`Неизвестный тип сообщения: ${clientMessage.type}`);
          ws.send(JSON.stringify({
            type: ServerMessageType.ERROR,
            payload: { message: `Неизвестный тип сообщения: ${clientMessage.type}` }
          }));
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', message, error);
      ws.send(JSON.stringify({
        type: ServerMessageType.ERROR,
        payload: { message: "Неверный формат сообщения." }
      }));
    }
  });

  ws.on('close', () => {
    console.log(`Клиент ${clientId} отключился`);
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error(`Ошибка WebSocket у клиента ${clientId}:`, error);
  });

  ws.send(JSON.stringify({
    type: ServerMessageType.NOTIFICATION,
    payload: {
      message: `Подключено к серверу. Ваш ID: ${clientId}`,
      level: 'info'
    }
  }));
});

server.listen(PORT, () => {
  console.log(`Сервер Dungeon Delvers Online запущен на порту ${PORT}`);
});
