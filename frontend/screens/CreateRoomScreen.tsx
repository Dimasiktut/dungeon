import React, { useState } from 'react';
import { Screen, RoomSettings } from '../types';
import { DEFAULT_MAX_PLAYERS, MIN_PLAYERS, MAX_PLAYERS_ALLOWED, DEFAULT_STARTING_LEVEL } from '../constants';
import Button from '../components/Button';
import Input from '../components/Input';

interface CreateRoomScreenProps {
  onCreateRoom: (settings: RoomSettings, playerName: string) => void;
  onBack: () => void;
}

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ onCreateRoom, onBack }) => {
  const [playerName, setPlayerName] = useState(`Герой${Math.floor(Math.random() * 100)}`);
  const [roomName, setRoomName] = useState(`Приключение ${Math.floor(Math.random() * 1000)}`);
  const [password, setPassword] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number>(DEFAULT_MAX_PLAYERS);
  const [startingLevel, setStartingLevel] = useState<number>(DEFAULT_STARTING_LEVEL);
  const [extraDecks, setExtraDecks] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() === '') {
      alert("Название приключения не может быть пустым!");
      return;
    }
    if (playerName.trim() === '') {
      alert("Имя игрока не может быть пустым!");
      return;
    }
    onCreateRoom({
      roomName: roomName.trim(),
      password: password || undefined,
      maxPlayers,
      startingLevel,
      extraDecks,
    }, playerName.trim());
  };

  const toggleDeck = (deckName: string) => {
    setExtraDecks(prev => 
      prev.includes(deckName) ? prev.filter(d => d !== deckName) : [...prev, deckName]
    );
  };

  const availableDecks = ["Забытые свитки", "Звери и барrows", "Проклятые реликвии"];

  return (
    <div className="p-6 md:p-8 bg-purple-800 bg-opacity-70 rounded-xl shadow-2xl border-4 border-yellow-400 w-full max-w-lg animate-slideUp game-font-applied">
      <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">Создать новое приключение</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя героя"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={30}
          required
        />
        <Input
          label="Название приключения"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          maxLength={50}
          required
        />
        <Input
          label="Пароль (необязательно)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={20}
        />

        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-2">Максимум игроков: {maxPlayers}</label>
          <input
            type="range"
            min={MIN_PLAYERS}
            max={MAX_PLAYERS_ALLOWED}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="w-full h-3 bg-purple-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-2">Начальный уровень: {startingLevel}</label>
           <select
            value={startingLevel}
            onChange={(e) => setStartingLevel(parseInt(e.target.value))}
            className="bg-purple-700 border-2 border-yellow-500 text-yellow-200 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5"
          >
            {[1, 2, 3].map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-2">Дополнительные колоды:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableDecks.map(deck => (
              <label key={deck} className="flex items-center space-x-2 p-2 bg-purple-700 rounded-md hover:bg-purple-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraDecks.includes(deck)}
                  onChange={() => toggleDeck(deck)}
                  className="form-checkbox h-5 w-5 text-yellow-500 bg-purple-900 border-purple-500 rounded focus:ring-yellow-400 focus:ring-offset-purple-800"
                />
                <span className="text-yellow-200">{deck}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 space-y-3 sm:space-y-0">
          <Button type="button" onClick={onBack} variant="secondary">
            Назад в таверну
          </Button>
          <Button type="submit" variant="primary" size="lg">
            Начать приключение!
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomScreen;