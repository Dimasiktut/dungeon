
import React from 'react';
import { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, isCurrentPlayer = false, size = 'md' }) => {
  const sizeClasses = {
    sm: { wrapper: 'w-24', img: 'w-12 h-12', text: 'text-xs', infoBox: 'mt-1' },
    md: { wrapper: 'w-32', img: 'w-16 h-16', text: 'text-sm', infoBox: 'mt-1' },
    lg: { wrapper: 'w-40', img: 'w-20 h-20', text: 'text-base', infoBox: 'mt-2' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center p-2 rounded-lg ${currentSize.wrapper} ${isCurrentPlayer ? 'bg-yellow-500 bg-opacity-30 border-2 border-yellow-400 shadow-lg' : 'bg-purple-700 bg-opacity-50'}`}>
      <img
        src={player.avatarUrl}
        alt={player.name}
        className={`${currentSize.img} rounded-full border-2 ${isCurrentPlayer ? 'border-yellow-300' : 'border-purple-400'} object-cover shadow-md mb-1`}
      />
      <p className={`${currentSize.text} font-semibold text-yellow-300 truncate w-full text-center game-font-applied`}>{player.name}</p>
      <div className={`flex justify-around w-full ${currentSize.infoBox} ${currentSize.text}`}>
        <p className={`text-yellow-200 game-font-applied`}>Lvl: {player.level}</p>
        <p className={`text-green-400 game-font-applied`}>Gear: {player.gear}</p>
      </div>
    </div>
  );
};

export default PlayerAvatar;