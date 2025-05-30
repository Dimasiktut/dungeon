import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Screen, RoomSettings, Player, ChatMessage, GameState, Card, TurnPhase, CardType,
  ClientMessage, ClientMessageType, ServerMessage, ServerMessageType,
  CreateRoomPayload, JoinRoomPayload, SendChatMessagePayload, PlayerActionPayload,
  RoomCreatedPayload, RoomJoinedPayload, PlayerJoinedRoomPayload, PlayerLeftRoomPayload,
  ChatMessageBroadcastPayload, GameStateUpdatePayload, ErrorPayload, NotificationPayload, ActiveRoom, GameStartedPayload, RoomUpdatePayload
} from './types';
import {
  DEFAULT_MAX_PLAYERS,
  DEFAULT_STARTING_LEVEL,
  MIN_PLAYERS,
  PLACEHOLDER_AVATARS
} from './constants';
import MainMenuScreen from './screens/MainMenuScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameTableScreen from './screens/GameTableScreen';
import SettingsScreen from './screens/SettingsScreen';
import JoinRoomModal from './components/JoinRoomModal';

// Добавляем enum для статуса подключения
enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

interface NotificationItem {
  id: number;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: number;
}

const SERVER_URL = window.location.protocol === 'https:' 
  ? 'wss://dungeon-3auz.onrender.com/' 
  : 'ws://localhost:8080';

// WebSocket Manager класс
class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageQueue: ClientMessage[] = [];
  private onStatusChange: (status: ConnectionStatus) => void;
  private onMessage: (message: ServerMessage) => void;
  private onNotification: (message: string, level: 'info' | 'warning' | 'error') => void;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(
    url: string,
    onStatusChange: (status: ConnectionStatus) => void,
    onMessage: (message: ServerMessage) => void,
    onNotification: (message: string, level: 'info' | 'warning' | 'error') => void
  ) {
    this.url = url;
    this.onStatusChange = onStatusChange;
    this.onMessage = onMessage;
    this.onNotification = onNotification;
  }

  connect() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    this.onStatusChange(this.reconnectAttempts === 0 ? ConnectionStatus.CONNECTING : ConnectionStatus.RECONNECTING);
    
    console.log(`🔄 Attempting WebSocket connection... (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    // Показываем уведомления
    if (this.reconnectAttempts === 0) {
      this.onNotification('Connecting to Dungeon Delvers server...', 'info');
    } else if (this.reconnectAttempts < 5) {
      this.onNotification(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'warning');
    }

    try {
      this.ws = new WebSocket(this.url);
      
      // Таймаут для подключения (важно для Render cold starts)
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ Connection timeout, closing...');
          this.ws.close();
        }
      }, 15000); // 15 секунд таймаут для cold start

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onStatusChange(ConnectionStatus.CONNECTED);
        this.onNotification('Connected to server!', 'info');
        
        // Отправляем накопленные сообщения
        this.flushMessageQueue();
        
        // Запускаем ping для поддержания соединения
        this.startPing();
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`❌ WebSocket connection closed: ${event.code} - ${event.reason}`);
        this.isConnecting = false;
        this.stopPing();
        
        // Очищаем предыдущий таймаут переподключения
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.onStatusChange(ConnectionStatus.RECONNECTING);
          
          // Экспоненциальная задержка с jitter для избежания thundering herd
          const baseDelay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
          const jitter = Math.random() * 1000; // Добавляем случайность
          const delay = Math.min(baseDelay + jitter, 30000);
          
          console.log(`⏳ Reconnecting in ${Math.round(delay / 1000)}s...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, delay);
        } else {
          this.onStatusChange(ConnectionStatus.ERROR);
          this.onNotification('Unable to connect to server. Please check your connection and refresh the page.', 'error');
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        
        if (this.reconnectAttempts === 0) {
          this.onNotification('Connection failed. Server may be starting up, please wait...', 'warning');
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          
          // Обработка PONG ответов
          if (message.type === 'PONG' as any) {
            console.log('📡 Received pong from server');
            return;
          }
          
          this.onMessage(message);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          this.onNotification('Received invalid message from server', 'error');
        }
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      this.isConnecting = false;
      this.onStatusChange(ConnectionStatus.ERROR);
      this.onNotification('Failed to create connection', 'error');
    }
  }

  send(message: ClientMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Error sending message:', error);
        return false;
      }
    } else {
      // Добавляем в очередь для отправки после подключения
      this.messageQueue.push(message);
      console.log('📤 Message queued, waiting for connection...');
      
      // Показываем уведомление только если не подключаемся уже
      if (!this.isConnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.onNotification('Message queued. Connecting to server...', 'warning');
        this.connect();
      }
      return false;
    }
  }

  private flushMessageQueue() {
    console.log(`📤 Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Error sending queued message:', error);
          // Возвращаем сообщение в очередь
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  private startPing() {
    this.stopPing(); // Убеждаемся что предыдущий ping остановлен
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          console.log('📡 Sending ping to server');
          this.ws.send(JSON.stringify({ type: 'PING' }));
        } catch (error) {
          console.error('❌ Error sending ping:', error);
        }
      }
    }, 30000); // Ping каждые 30 секунд
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    this.stopPing();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.messageQueue = [];
    this.onStatusChange(ConnectionStatus.DISCONNECTED);
  }

  getStatus(): ConnectionStatus {
    if (!this.ws) return ConnectionStatus.DISCONNECTED;
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return ConnectionStatus.CONNECTING;
      case WebSocket.OPEN:
        return ConnectionStatus.CONNECTED;
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return this.isConnecting ? ConnectionStatus.RECONNECTING : ConnectionStatus.DISCONNECTED;
      default:
        return ConnectionStatus.ERROR;
    }
  }

  forceReconnect() {
    console.log('🔄 Force reconnect requested');
    this.reconnectAttempts = 0;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }
}

// Компонент для отображения статуса подключения
const ConnectionStatusIndicator: React.FC<{ 
  status: ConnectionStatus;
  onReconnect: () => void;
}> = ({ status, onReconnect }) => {
  const getStatusInfo = () => {
    switch (status) {
      case ConnectionStatus.CONNECTING:
        return { 
          text: 'Connecting...', 
          color: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50', 
          icon: '🔄',
          spinning: true
        };
      case ConnectionStatus.CONNECTED:
        return { 
          text: 'Connected', 
          color: 'text-green-400 bg-green-900/30 border-green-500/50', 
          icon: '✅',
          spinning: false
        };
      case ConnectionStatus.RECONNECTING:
        return { 
          text: 'Reconnecting...', 
          color: 'text-orange-400 bg-orange-900/30 border-orange-500/50', 
          icon: '🔄',
          spinning: true
        };
      case ConnectionStatus.DISCONNECTED:
        return { 
          text: 'Disconnected', 
          color: 'text-gray-400 bg-gray-900/30 border-gray-500/50', 
          icon: '⚫',
          spinning: false
        };
      case ConnectionStatus.ERROR:
        return { 
          text: 'Connection Error', 
          color: 'text-red-400 bg-red-900/30 border-red-500/50', 
          icon: '❌',
          spinning: false
        };
      default:
        return { 
          text: 'Unknown', 
          color: 'text-gray-400 bg-gray-900/30 border-gray-500/50', 
          icon: '❓',
          spinning: false
        };
    }
  };

  const { text, color, icon, spinning } = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border ${color} cursor-pointer`}
         onClick={status === ConnectionStatus.ERROR ? onReconnect : undefined}>
      <span className={spinning ? 'animate-spin' : ''}>
        {icon}
      </span>
      <span className="text-sm font-medium">{text}</span>
      {status === ConnectionStatus.ERROR && (
        <span className="text-xs opacity-75 ml-2">Click to retry</span>
      )}
    </div>
  );
};

// Компонент уведомлений
const NotificationContainer: React.FC<{ 
  notifications: NotificationItem[];
  onDismiss: (id: number) => void;
}> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 space-y-2 z-40 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            notification.level === 'error' ? 'bg-red-900/80 border border-red-500/50' :
            notification.level === 'warning' ? 'bg-yellow-900/80 border border-yellow-500/50' :
            'bg-blue-900/80 border border-blue-500/50'
          }`}
          onClick={() => onDismiss(notification.id)}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">
              {notification.level === 'error' ? '❌' : 
               notification.level === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">Click to dismiss</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MainMenu);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ActiveRoom | null>(null);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const notificationIdRef = useRef(0);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const showNotification = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    const id = ++notificationIdRef.current;
    const notification: NotificationItem = {
      id,
      message,
      level,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Автоматически убираем уведомление через 5 секунд
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, level === 'error' ? 8000 : 5000); // Ошибки показываем дольше
    
    console.log(`Notification (${level}): ${message}`);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleMessage = useCallback((message: ServerMessage) => {
    console.log('📨 Received message:', message);
    
    try {
      switch (message.type) {
        case ServerMessageType.ERROR:
          const errorPayload = message.payload as ErrorPayload;
          showNotification(`Server Error: ${errorPayload.message}`, 'error');
          break;
          
        case ServerMessageType.NOTIFICATION:
          const notificationPayload = message.payload as NotificationPayload;
          showNotification(notificationPayload.message, notificationPayload.level);
          break;
          
        case ServerMessageType.ROOM_CREATED:
          const roomCreatedPayload = message.payload as RoomCreatedPayload;
          setCurrentRoom(roomCreatedPayload.room);
          const creatorPlayer = roomCreatedPayload.room.players.find(p => p.id === roomCreatedPayload.localPlayerId);
          setLocalPlayer(creatorPlayer || null);
          navigateTo(Screen.Lobby);
          showNotification(`Room "${roomCreatedPayload.room.settings.roomName}" created! Your ID: ${roomCreatedPayload.localPlayerId}`, 'info');
          break;
          
        case ServerMessageType.ROOM_JOINED:
          const roomJoinedPayload = message.payload as RoomJoinedPayload;
          setCurrentRoom(roomJoinedPayload.room);
          const joinerPlayer = roomJoinedPayload.room.players.find(p => p.id === roomJoinedPayload.localPlayerId);
          setLocalPlayer(joinerPlayer || null);
          navigateTo(Screen.Lobby);
          showNotification(`Joined room "${roomJoinedPayload.room.settings.roomName}"! Your ID: ${roomJoinedPayload.localPlayerId}`, 'info');
          break;
          
        case ServerMessageType.PLAYER_JOINED_ROOM:
        case ServerMessageType.PLAYER_LEFT_ROOM:
        case ServerMessageType.ROOM_UPDATE:
          const roomUpdatePayload = message.payload as RoomUpdatePayload;
          
          if (currentRoom && roomUpdatePayload.room.id === currentRoom.id) {
            setCurrentRoom(roomUpdatePayload.room);
            const updatedLocalPlayer = roomUpdatePayload.room.players.find(p => p.id === localPlayer?.id);
            if (updatedLocalPlayer) {
              setLocalPlayer(updatedLocalPlayer);
            }
          } else if (message.type === ServerMessageType.PLAYER_JOINED_ROOM && localPlayer && roomUpdatePayload.room.players.find(p=>p.id === localPlayer.id)) {
            setCurrentRoom(roomUpdatePayload.room);
            const updatedLocalPlayer = roomUpdatePayload.room.players.find(p => p.id === localPlayer.id);
            if (updatedLocalPlayer) setLocalPlayer(updatedLocalPlayer);
          }
          
          if(message.type === ServerMessageType.PLAYER_JOINED_ROOM){
            const pJoinedPayload = message.payload as PlayerJoinedRoomPayload;
            if (pJoinedPayload.player.id !== localPlayer?.id && currentRoom && pJoinedPayload.room.id === currentRoom.id) {
              showNotification(`${pJoinedPayload.player.name} joined the room.`, 'info');
            }
          }
          
          if(message.type === ServerMessageType.PLAYER_LEFT_ROOM){
            const pLeftPayload = message.payload as PlayerLeftRoomPayload;
            const leftPlayerName = roomUpdatePayload.room.players.find(p => p.id === pLeftPayload.playerId)?.name || 
                               currentRoom?.players.find(p => p.id === pLeftPayload.playerId)?.name;
            if (currentRoom && pLeftPayload.room.id === currentRoom.id) {
              showNotification(`${leftPlayerName || 'A player'} left the room.`, 'info');
            }
          }
          break;
          
        case ServerMessageType.CHAT_MESSAGE_BROADCAST:
          const chatPayload = message.payload as ChatMessageBroadcastPayload;
          if (currentRoom && chatPayload.roomId === currentRoom.id) {
            setCurrentRoom(prevRoom => {
              if (!prevRoom) return null;
              if (prevRoom.chatMessages.find(msg => msg.id === chatPayload.id)) return prevRoom;
              return {
                ...prevRoom,
                chatMessages: [...prevRoom.chatMessages, chatPayload]
              };
            });
          }
          break;
          
        case ServerMessageType.GAME_STARTED:
          const gameStartedPayload = message.payload as GameStartedPayload;
          if (currentRoom && gameStartedPayload.roomId === currentRoom.id) {
            setCurrentRoom(prevRoom => prevRoom ? ({ ...prevRoom, gameState: gameStartedPayload.gameState }) : null);
            navigateTo(Screen.GameTable);
            showNotification('The adventure begins!', 'info');
          }
          break;
          
        case ServerMessageType.GAME_STATE_UPDATE:
          const gameUpdatePayload = message.payload as GameStateUpdatePayload;
          if (currentRoom && gameUpdatePayload.roomId === currentRoom.id) {
            setCurrentRoom(prevRoom => prevRoom ? ({ ...prevRoom, gameState: gameUpdatePayload.gameState }) : null);
            const updatedLocalPlayerFromGame = gameUpdatePayload.gameState.players.find(p => p.id === localPlayer?.id);
            if (updatedLocalPlayerFromGame) setLocalPlayer(updatedLocalPlayerFromGame);
          }
          break;
          
        default:
          console.warn('❓ Received unknown message type from server:', message.type);
      }
    } catch (error) {
      console.error('❌ Error processing message from server:', error);
      showNotification('Error processing server message.', 'error');
    }
  }, [currentRoom, localPlayer, navigateTo, showNotification]);

  // Инициализация WebSocket менеджера
  useEffect(() => {
    console.log('🚀 Initializing WebSocket Manager...');
    
    wsManagerRef.current = new WebSocketManager(
      SERVER_URL,
      setConnectionStatus,
      handleMessage,
      showNotification
    );
    
    // Начинаем подключение
    wsManagerRef.current.connect();
    
    return () => {
      console.log('🔌 Cleaning up WebSocket Manager...');
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [handleMessage, showNotification]);

  // Обработка изменения статуса подключения
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.DISCONNECTED || connectionStatus === ConnectionStatus.ERROR) {
      // Сбрасываем состояние при потере соединения
      setLocalPlayer(null);
      setCurrentRoom(null);
      if (currentScreen !== Screen.MainMenu) {
        navigateTo(Screen.MainMenu);
      }
    }
  }, [connectionStatus, currentScreen, navigateTo]);

  const sendMessageToServer = useCallback((message: ClientMessage) => {
    if (wsManagerRef.current) {
      const success = wsManagerRef.current.send(message);
      if (!success && connectionStatus !== ConnectionStatus.CONNECTING && connectionStatus !== ConnectionStatus.RECONNECTING) {
        showNotification('Failed to send message. Check your connection.', 'error');
      }
      return success;
    }
    return false;
  }, [connectionStatus, showNotification]);

  const handleForceReconnect = useCallback(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.forceReconnect();
    }
  }, []);

  // --- Action Handlers ---
  const handleCreateRoom = useCallback((settings: RoomSettings, playerName: string) => {
    if (!playerName.trim()) {
      showNotification("Please enter a player name.", "warning");
      return;
    }
    if (connectionStatus !== ConnectionStatus.CONNECTED) {
      showNotification("Not connected to server. Please wait for connection.", "warning");
      return;
    }
    const payload: CreateRoomPayload = { ...settings, playerName };
    sendMessageToServer({ type: ClientMessageType.CREATE_ROOM, payload });
  }, [sendMessageToServer, showNotification, connectionStatus]);

  const handleJoinRoomAttempt = useCallback((roomId: string, playerName: string) => {
    if (!playerName.trim()) {
      showNotification("Please enter a player name.", "warning");
      return;
    }
    if (!roomId.trim()) {
      showNotification("Please enter a Room ID.", "warning");
      return;
    }
    if (connectionStatus !== ConnectionStatus.CONNECTED) {
      showNotification("Not connected to server. Please wait for connection.", "warning");
      return;
    }
    const payload: JoinRoomPayload = { roomId, playerName };
    sendMessageToServer({ type: ClientMessageType.JOIN_ROOM, payload });
    setIsJoinRoomModalOpen(false);
  }, [sendMessageToServer, showNotification, connectionStatus]);

  const handleSendMessage = useCallback((text: string) => {
    if (!currentRoom || !localPlayer) {
      showNotification("Cannot send message: Not in a room or player not identified.", "warning");
      return;
    }
    const payload: SendChatMessagePayload = { text };
    sendMessageToServer({
      type: ClientMessageType.SEND_CHAT_MESSAGE,
      roomId: currentRoom.id,
      playerId: localPlayer.id,
      payload
    });
  }, [sendMessageToServer, currentRoom, localPlayer, showNotification]);

  const handleStartGame = useCallback(() => {
    if (!currentRoom || !localPlayer || !localPlayer.isHost) {
      showNotification("Cannot start game: Not in a room, not identified, or not the host.", "warning");
      return;
    }
    sendMessageToServer({ type: ClientMessageType.START_GAME, roomId: currentRoom.id, playerId: localPlayer.id });
  }, [sendMessageToServer, currentRoom, localPlayer, showNotification]);

  const handleLeaveRoomOrExitGame = useCallback(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      setTimeout(() => {
        if (wsManagerRef.current) {
          wsManagerRef.current.connect();
        }
      }, 1000);
    }
  }, []);

  // --- Game Action Handlers ---
  const genericGameActionHandler = useCallback((actionType: ClientMessageType, actionPayload?: any) => {
    if (!currentRoom || !currentRoom.gameState || !localPlayer) {
      showNotification("Game not active or player not found.", "error");
      return;
    }
    if (currentRoom.gameState.currentPlayerId !== localPlayer.id) {
      showNotification("It's not your turn!", "warning");
      return;
    }
    sendMessageToServer({
      type: actionType,
      roomId: currentRoom.id,
      playerId: localPlayer.id,
      payload: actionPayload
    });
  }, [currentRoom, localPlayer, sendMessageToServer, showNotification]);

  const handleKickOpenDoor = useCallback(() => {
    genericGameActionHandler(ClientMessageType.KICK_OPEN_DOOR);
  }, [genericGameActionHandler]);

  const handleResolveDoorCard = useCallback((resolutionAction: 'takeToHand' | 'applyCurse' | 'fightMonster' | 'playImmediately') => {
    const payload: PlayerActionPayload = { actionType: 'RESOLVE_DOOR_CARD', resolutionAction };
    genericGameActionHandler(ClientMessageType.RESOLVE_DOOR_CARD, payload);
  }, [genericGameActionHandler]);

  const handleLootRoom = useCallback(() => {
    genericGameActionHandler(ClientMessageType.LOOT_ROOM);
  }, [genericGameActionHandler]);

  const handlePlayCardFromHand = useCallback((cardId: string) => {
    const payload: PlayerActionPayload = { actionType: 'PLAY_CARD', cardId };
    if (currentRoom?.gameState && currentRoom.gameState.currentPlayerId === localPlayer?.id) {
      if (![TurnPhase.LookingForTrouble, TurnPhase.KickOpenDoor, TurnPhase.Combat, TurnPhase.Charity, TurnPhase.ResolveDoorCard, TurnPhase.LootTheRoom].includes(currentRoom.gameState.turnPhase)) {
        showNotification("Cannot play cards at this time (invalid phase).", "warning");
        return;
      }
      genericGameActionHandler(ClientMessageType.PLAY_CARD_FROM_HAND, payload);
    } else {
      showNotification("Cannot play card: Not your turn or invalid game phase.", "warning");
    }
  }, [genericGameActionHandler, currentRoom?.gameState, localPlayer?.id, showNotification]);

  const handleEndTurn = useCallback(() => {
    genericGameActionHandler(ClientMessageType.END_TURN);
  }, [genericGameActionHandler]);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.MainMenu:
        return (
          <MainMenuScreen
            onNavigate={navigateTo}
            onJoinRoom={() => setIsJoinRoomModalOpen(true)}
            onExit={handleLeaveRoomOrExitGame}
          />
        );
      case Screen.CreateRoom:
        return (
          <CreateRoomScreen
            onCreateRoom={(settings, playerName) => handleCreateRoom(settings, playerName)}
            onBack={() => navigateTo(Screen.MainMenu)}
          />
        );
      case Screen.Lobby:
        if (!currentRoom || !localPlayer) {
          // This state should ideally be prevented by onclose handler.
          if(socketRef.current && socketRef.current.readyState !== WebSocket.CONNECTING) {
             console.warn("Attempted to render Lobby without room or player. Redirecting.");
             navigateTo(Screen.MainMenu);
          } // Avoid redirect if still connecting
          return <div className="text-xl p-8">Connecting to adventure... If this persists, the server may be unavailable.</div>;
        }
        return (
          <LobbyScreen
            roomName={currentRoom.settings.roomName}
            roomId={currentRoom.id}
            players={currentRoom.players}
            chatMessages={currentRoom.chatMessages}
            onSendMessage={handleSendMessage}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoomOrExitGame}
            isHost={localPlayer.isHost || false}
            localPlayerId={localPlayer.id}
          />
        );
      case Screen.GameTable:
        if (!currentRoom || !currentRoom.gameState || !localPlayer) {
          if(socketRef.current && socketRef.current.readyState !== WebSocket.CONNECTING) {
            console.warn("Attempted to render GameTable without game state. Redirecting.");
            navigateTo(Screen.MainMenu);
          }
          return <div className="text-xl p-8">Loading game table... Ensure you're in an active game.</div>;
        }
        return (
          <GameTableScreen
            gameState={currentRoom.gameState}
            localPlayerId={localPlayer.id}
            onKickOpenDoor={handleKickOpenDoor}
            onResolveDoorCard={handleResolveDoorCard}
            onLootRoom={handleLootRoom}
            onPlayCardFromHand={handlePlayCardFromHand}
            onEndTurn={handleEndTurn}
            onExitGame={handleLeaveRoomOrExitGame}
          />
        );
      case Screen.Settings:
        return <SettingsScreen onBack={() => navigateTo(Screen.MainMenu)} />;
      default:
        return <MainMenuScreen onNavigate={navigateTo} onJoinRoom={() => setIsJoinRoomModalOpen(true)} onExit={handleLeaveRoomOrExitGame}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 text-yellow-300 flex flex-col items-center justify-center p-2 md:p-4 game-font-applied">
      <style>{`.game-font-applied { font-family: 'Ruslan Display', cursive; }`}</style>
      {renderScreen()}
      <JoinRoomModal
        isOpen={isJoinRoomModalOpen}
        onClose={() => setIsJoinRoomModalOpen(false)}
        onJoinAttempt={handleJoinRoomAttempt}
      />
    </div>
  );
};

export default App;