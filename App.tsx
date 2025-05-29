
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
const SERVER_URL = 
  window.location.protocol === 'https:' 
    ? 'wss://dungeon-qrdh.onrender.com:8080' 
    : 'ws://localhost:8080';


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MainMenu);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ActiveRoom | null>(null);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  // Use a ref for navigateTo to avoid it as a dependency in the main socket effect if it causes issues.
  // However, navigateTo is stable due to its own useCallback(..., []).
  // Similar for showNotification, setCurrentRoom, setLocalPlayer.

  const showNotification = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    alert(`[${level.toUpperCase()}] ${message}`);
    console.log(`Notification (${level}): ${message}`);
  }, []);
  
  const sendMessageToServer = useCallback((message: ClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
      showNotification('Not connected to server. Please try again.', 'error');
    }
  }, [showNotification]);

  // Effect for establishing and managing WebSocket connection lifecycle
  useEffect(() => {
    console.log('Attempting to establish WebSocket connection...');
    socketRef.current = new WebSocket(SERVER_URL);
    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      showNotification('Connected to Dungeon Delvers server!', 'info');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
      showNotification('Disconnected from server.', 'warning');
      setLocalPlayer(null);
      setCurrentRoom(null);
      navigateTo(Screen.MainMenu);
    };

    socket.onerror = (event) => {
      console.error('WebSocket error event:', event);
      showNotification('WebSocket connection error. Ensure the server is running and reachable. Check console for details.', 'error');
      // onclose will usually follow an onerror event for connection failures
    };

    return () => {
      if (socket) {
        console.log('Closing WebSocket connection due to component unmount or effect re-run.');
        socket.close();
      }
    };
  }, [navigateTo, showNotification]); // navigateTo and showNotification are stable due to useCallback(..., [])

  // Effect for handling incoming WebSocket messages
  useEffect(() => {
    if (!socketRef.current) {
      return;
    }
    const socket = socketRef.current;

    const messageHandler = (event: MessageEvent) => {
      try {
        const serverMessage = JSON.parse(event.data as string) as ServerMessage;
        console.log('Message from server:', serverMessage);

        switch (serverMessage.type) {
          case ServerMessageType.ERROR:
            const errorPayload = serverMessage.payload as ErrorPayload;
            showNotification(`Server Error: ${errorPayload.message}`, 'error');
            break;

          case ServerMessageType.NOTIFICATION:
            const notificationPayload = serverMessage.payload as NotificationPayload;
            showNotification(notificationPayload.message, notificationPayload.level);
            break;
            
          case ServerMessageType.ROOM_CREATED:
            const roomCreatedPayload = serverMessage.payload as RoomCreatedPayload;
            setCurrentRoom(roomCreatedPayload.room);
            const creatorPlayer = roomCreatedPayload.room.players.find(p => p.id === roomCreatedPayload.localPlayerId);
            setLocalPlayer(creatorPlayer || null);
            navigateTo(Screen.Lobby);
            showNotification(`Room "${roomCreatedPayload.room.settings.roomName}" created! Your ID: ${roomCreatedPayload.localPlayerId}`, 'info');
            break;

          case ServerMessageType.ROOM_JOINED:
            const roomJoinedPayload = serverMessage.payload as RoomJoinedPayload;
            setCurrentRoom(roomJoinedPayload.room);
            const joinerPlayer = roomJoinedPayload.room.players.find(p => p.id === roomJoinedPayload.localPlayerId);
            setLocalPlayer(joinerPlayer || null);
            navigateTo(Screen.Lobby);
            showNotification(`Joined room "${roomJoinedPayload.room.settings.roomName}"! Your ID: ${roomJoinedPayload.localPlayerId}`, 'info');
            break;

          case ServerMessageType.PLAYER_JOINED_ROOM:
          case ServerMessageType.PLAYER_LEFT_ROOM:
          case ServerMessageType.ROOM_UPDATE:
            const roomUpdatePayload = serverMessage.payload as RoomUpdatePayload;
             // Check if currentRoom context exists and matches the update
            if (currentRoom && roomUpdatePayload.room.id === currentRoom.id) {
                setCurrentRoom(roomUpdatePayload.room);
                // Update local player if their data changed within the room context
                const updatedLocalPlayer = roomUpdatePayload.room.players.find(p => p.id === localPlayer?.id);
                if (updatedLocalPlayer) {
                    setLocalPlayer(updatedLocalPlayer);
                }
            } else if (serverMessage.type === ServerMessageType.PLAYER_JOINED_ROOM && localPlayer && roomUpdatePayload.room.players.find(p=>p.id === localPlayer.id)) {
                // This case handles if a player joins a room and this client is that player,
                // but currentRoom might not be set yet if this is the initial join confirmation.
                // ROOM_JOINED should ideally handle this first. This is a fallback.
                setCurrentRoom(roomUpdatePayload.room);
                const updatedLocalPlayer = roomUpdatePayload.room.players.find(p => p.id === localPlayer.id);
                 if (updatedLocalPlayer) setLocalPlayer(updatedLocalPlayer);
            }


            if(serverMessage.type === ServerMessageType.PLAYER_JOINED_ROOM){
                const pJoinedPayload = serverMessage.payload as PlayerJoinedRoomPayload;
                // Only show notification if it's about another player or if currentRoom context matches
                if (pJoinedPayload.player.id !== localPlayer?.id && currentRoom && pJoinedPayload.room.id === currentRoom.id) {
                    showNotification(`${pJoinedPayload.player.name} joined the room.`, 'info');
                }
            }
             if(serverMessage.type === ServerMessageType.PLAYER_LEFT_ROOM){
                const pLeftPayload = serverMessage.payload as PlayerLeftRoomPayload;
                 // Use the name from the payload's updated room object to find the player who left.
                const leftPlayerName = roomUpdatePayload.room.players.find(p => p.id === pLeftPayload.playerId)?.name || 
                                   currentRoom?.players.find(p => p.id === pLeftPayload.playerId)?.name; // Fallback to previous state if needed

                if (currentRoom && pLeftPayload.room.id === currentRoom.id) {
                    showNotification(`${leftPlayerName || 'A player'} left the room.`, 'info');
                }
            }
            break;

          case ServerMessageType.CHAT_MESSAGE_BROADCAST:
            const chatPayload = serverMessage.payload as ChatMessageBroadcastPayload;
            if (currentRoom && chatPayload.roomId === currentRoom.id) {
              setCurrentRoom(prevRoom => {
                if (!prevRoom) return null;
                // Avoid duplicates if message already exists (e.g. from optimistic update)
                if (prevRoom.chatMessages.find(msg => msg.id === chatPayload.id)) return prevRoom;
                return {
                  ...prevRoom,
                  chatMessages: [...prevRoom.chatMessages, chatPayload]
                };
              });
            }
            break;

          case ServerMessageType.GAME_STARTED:
            const gameStartedPayload = serverMessage.payload as GameStartedPayload;
             if (currentRoom && gameStartedPayload.roomId === currentRoom.id) {
                setCurrentRoom(prevRoom => prevRoom ? ({ ...prevRoom, gameState: gameStartedPayload.gameState }) : null);
                navigateTo(Screen.GameTable);
                showNotification('The adventure begins!', 'info');
            }
            break;

          case ServerMessageType.GAME_STATE_UPDATE:
            const gameUpdatePayload = serverMessage.payload as GameStateUpdatePayload;
            if (currentRoom && gameUpdatePayload.roomId === currentRoom.id) {
              setCurrentRoom(prevRoom => prevRoom ? ({ ...prevRoom, gameState: gameUpdatePayload.gameState }) : null);
              const updatedLocalPlayerFromGame = gameUpdatePayload.gameState.players.find(p => p.id === localPlayer?.id);
              if (updatedLocalPlayerFromGame) setLocalPlayer(updatedLocalPlayerFromGame);
            }
            break;
            
          default:
            console.warn('Received unknown message type from server:', serverMessage.type);
        }
      } catch (error) {
        console.error('Error processing message from server:', error);
        showNotification('Received malformed message from server.', 'error');
      }
    };
    
    socket.onmessage = messageHandler;

    // Cleanup function for this effect
    return () => {
      // Remove the message handler when the effect cleans up or dependencies change.
      // This is important if messageHandler itself closes over stale state.
      // Re-assigning onmessage in the next run of the effect is usually sufficient.
      // socket.onmessage = null; 
    };
  }, [currentRoom, localPlayer, navigateTo, showNotification]); // Dependencies for the message handler logic


  // --- Action Handlers ---
  const handleCreateRoom = useCallback((settings: RoomSettings, playerName: string) => {
    if (!playerName.trim()) {
      showNotification("Please enter a player name.", "warning");
      return;
    }
    const payload: CreateRoomPayload = { ...settings, playerName };
    sendMessageToServer({ type: ClientMessageType.CREATE_ROOM, payload });
  }, [sendMessageToServer, showNotification]);

  const handleJoinRoomAttempt = useCallback((roomId: string, playerName: string) => {
    if (!playerName.trim()) {
      showNotification("Please enter a player name.", "warning");
      return;
    }
     if (!roomId.trim()) {
      showNotification("Please enter a Room ID.", "warning");
      return;
    }
    const payload: JoinRoomPayload = { roomId, playerName };
    sendMessageToServer({ type: ClientMessageType.JOIN_ROOM, payload });
    setIsJoinRoomModalOpen(false);
  }, [sendMessageToServer, showNotification]);

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
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // Server will handle cleanup via 'onclose' or a specific LEAVE_ROOM message if implemented.
        // For now, just closing the socket is the primary mechanism for leaving.
        socketRef.current.close(); 
        // State will be reset by the socket's onclose handler.
    } else {
        // If socket wasn't open or already closed, manually reset state.
        showNotification("Left the adventure (or were not connected).", "info");
        setLocalPlayer(null);
        setCurrentRoom(null);
        navigateTo(Screen.MainMenu);
    }
  }, [navigateTo, showNotification]);


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
    const payload: PlayerActionPayload = { actionType: 'RESOLVE_DOOR_CARD', resolutionAction }; // No longer actionType on payload, it's implied by ClientMessageType
    genericGameActionHandler(ClientMessageType.RESOLVE_DOOR_CARD, payload); // Send specific PlayerActionPayload as payload
  }, [genericGameActionHandler]);

  const handleLootRoom = useCallback(() => {
    genericGameActionHandler(ClientMessageType.LOOT_ROOM);
  }, [genericGameActionHandler]);

  const handlePlayCardFromHand = useCallback((cardId: string) => {
    const payload: PlayerActionPayload = { actionType: 'PLAY_CARD', cardId }; // actionType for server to know what kind of player action this is.
     if (currentRoom?.gameState && currentRoom.gameState.currentPlayerId === localPlayer?.id) {
       // Phase check could be more granular or primarily server-side
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