import React from 'react';
import { Player, ChatMessage } from '../types';
import { MIN_PLAYERS } from '../constants';
import Button from '../components/Button';
import PlayerAvatar from '../components/PlayerAvatar';
import ChatWindow from '../components/ChatWindow';

interface LobbyScreenProps {
  roomName: string;
  roomId: string;
  players: Player[];
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isHost: boolean;
  localPlayerId: string;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomName,
  roomId,
  players,
  chatMessages,
  onSendMessage,
  onStartGame,
  onLeaveRoom,
  isHost,
  localPlayerId,
}) => {
  return (
    <div className="p-4 md:p-6 bg-purple-800 bg-opacity-60 rounded-xl shadow-2xl border-4 border-yellow-400 w-full max-w-4xl min-h-[90vh] max-h-[95vh] flex flex-col animate-fadeIn game-font-applied">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-1 text-center flex-grow">Вы в комнате «{roomName}»</h2>
        <p className="text-sm text-purple-300 bg-purple-900 px-2 py-1 rounded-md">ID комнаты: {roomId}</p>
      </div>
      <p className="text-center text-purple-200 mb-4 text-xs">Поделись ID комнаты с друзьями, чтобы они могли присоединиться!</p>
      
      <div className="flex flex-col md:flex-row flex-grow gap-4 overflow-hidden">
        {/* Список игроков */}
        <div className="md:w-1/3 bg-purple-700 bg-opacity-50 p-3 rounded-lg shadow-lg border-2 border-yellow-500 flex flex-col">
          <h3 className="text-xl text-yellow-300 font-semibold mb-3 text-center">Игроки ({players.length}):</h3>
          <div className="space-y-3 overflow-y-auto flex-grow max-h-96 md:max-h-full scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-purple-600 pr-1">
            {players.map((player) => (
              <PlayerAvatar key={player.id} player={player} isCurrentPlayer={player.id === localPlayerId} size="md" />
            ))}
            {players.length === 0 && (
              <p className="text-purple-300 text-center italic">Комната пока пуста...</p>
            )}
          </div>
        </div>

        {/* Чат */}
        <div className="md:w-2/3 h-full min-h-[300px] md:min-h-0 flex flex-col">
          <ChatWindow messages={chatMessages} onSendMessage={onSendMessage} localPlayerId={localPlayerId} />
        </div>
      </div>

      {/* Управление */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button onClick={onLeaveRoom} variant="danger" size="md">
          Покинуть комнату
        </Button>

        {isHost && (
          <Button 
            onClick={onStartGame} 
            disabled={players.length < MIN_PLAYERS} 
            variant="primary" 
            size="lg"
            className={players.length < MIN_PLAYERS ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {players.length < MIN_PLAYERS
              ? `Нужно ещё ${MIN_PLAYERS - players.length} игрок(а)`
              : 'Начать приключение'}
          </Button>
        )}

        {!isHost && (
          <p className="text-yellow-200 italic">
            Ожидаем, пока хост ({players.find(p => p.isHost)?.name || 'неизвестен'}) начнёт игру...
          </p>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
