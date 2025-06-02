// This file would ideally share types with the frontend.
// For this exercise, we'll re-declare or adapt necessary types.
// In a monorepo, you'd share a 'common' types package.

import WebSocket from 'ws';

// --- Copied/Adapted from frontend/types.ts ---
export enum TurnPhase {
  KickOpenDoor = 'KickOpenDoor',
  ResolveDoorCard = 'ResolveDoorCard',
  Combat = 'Combat',
  LootTheRoom = 'LootTheRoom',
  LookingForTrouble = 'LookingForTrouble',
  Charity = 'Charity',
  TurnEnd = 'TurnEnd',
}

export interface Player {
  id: string; // WebSocket connection ID or unique player ID
  name: string;
  avatarUrl: string;
  level: number;
  gear: number;
  equippedItems: Card[];
  cardsInHand: Card[];
  isHost?: boolean;
  ws: WebSocket; // Server-side WebSocket connection object
}

export interface RoomSettings {
  roomName: string;
  password?: string;
  maxPlayers: number;
  extraDecks: string[];
  startingLevel: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: Date;
  roomId: string;
}

export enum CardType {
  Door = 'Door', Treasure = 'Treasure', Monster = 'Monster', Curse = 'Curse',
  Item = 'Item', Class = 'Class', Race = 'Race', OneShot = 'OneShot',
  MonsterEnhancer = 'MonsterEnhancer', SpecialDoor = 'SpecialDoor',
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  imageUrl?: string;
  value?: number;
  bonus?: number;
  level?: number;
  treasures?: number;
  badStuff?: string;
  // effect?: (gameState: GameState, playerId: string) => GameState; // Effects are server-side
}

export interface GameState {
  roomId: string;
  players: Player[]; // Server-side GameState stores full Player objects
  currentPlayerId: string | null;
  doorDeck: Card[];
  treasureDeck: Card[];
  doorDiscard: Card[];
  treasureDiscard: Card[];
  turnPhase: TurnPhase;
  currentEncounterCard: Card | null;
  activeMonster: Card | null;
  log: string[];
  isGameStarted: boolean;
}

export interface ActiveRoom {
  id: string; // Room ID
  settings: RoomSettings;
  players: Player[]; // Server-side player objects (include ws)
  chatMessages: ChatMessage[];
  gameState: GameState | null; // Server-side GameState
  hostId: string | null; // ID of the host player
}

// --- Client-Specific Types (for sanitized data) ---
export interface PlayerForClient extends Omit<Player, 'ws'> {}

export interface GameStateForClient extends Omit<GameState, 'players'> {
  players: PlayerForClient[];
}

export interface ActiveRoomForClient extends Omit<ActiveRoom, 'players' | 'gameState'> {
  players: PlayerForClient[];
  gameState: GameStateForClient | null;
}


// --- WebSocket Message Types (Mirrors frontend for consistency) ---

export enum ClientMessageType {
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE',
  START_GAME = 'START_GAME',
  PLAYER_ACTION = 'PLAYER_ACTION',
  KICK_OPEN_DOOR = 'KICK_OPEN_DOOR',
  RESOLVE_DOOR_CARD = 'RESOLVE_DOOR_CARD',
  PLAY_CARD_FROM_HAND = 'PLAY_CARD_FROM_HAND',
  END_TURN = 'END_TURN',
  LOOT_ROOM = 'LOOT_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  // ✅ Добавь это:
  PING = 'PING',
}

export interface ClientMessage {
  type: ClientMessageType;
  payload?: any;
  roomId?: string;
  playerId?: string; // Added by server on message receive if not present
}
export interface CreateRoomPayload extends RoomSettings { playerName: string; }
export interface JoinRoomPayload { roomId: string; playerName: string; }
export interface SendChatMessagePayload { text: string; }
export interface PlayerActionPayload {
  actionType: string; // e.g., "KICK_DOOR", "PLAY_CARD"
  cardId?: string;
  targetId?: string;
  resolutionAction?: 'takeToHand' | 'applyCurse' | 'fightMonster' | 'playImmediately';
}


export enum ServerMessageType {
  ERROR = 'ERROR', ROOM_CREATED = 'ROOM_CREATED', ROOM_JOINED = 'ROOM_JOINED',
  PLAYER_JOINED_ROOM = 'PLAYER_JOINED_ROOM', PLAYER_LEFT_ROOM = 'PLAYER_LEFT_ROOM',
  ROOM_UPDATE = 'ROOM_UPDATE', CHAT_MESSAGE_BROADCAST = 'CHAT_MESSAGE_BROADCAST',
  GAME_STARTED = 'GAME_STARTED', GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
  NOTIFICATION = 'NOTIFICATION',
}

export interface ServerMessage {
  type: ServerMessageType;
  payload: any;
}

// --- Sanitization Helper Functions ---
export function sanitizePlayerForClient(player: Player): PlayerForClient {
  const { ws, ...clientSafePlayer } = player;
  return clientSafePlayer;
}

export function sanitizeGameStateForClient(gameState: GameState): GameStateForClient {
    return {
        ...gameState,
        players: gameState.players.map(sanitizePlayerForClient),
    };
}

export function sanitizeRoomForClient(room: ActiveRoom): ActiveRoomForClient {
    return {
        ...room,
        players: room.players.map(sanitizePlayerForClient),
        gameState: room.gameState ? sanitizeGameStateForClient(room.gameState) : null,
    };
}