
import React from 'react';
import { Card as CardTypeData, CardType } from '../types';

interface CardProps {
  card: CardTypeData | null; 
  isFaceDown?: boolean;
  onClick?: (cardId: string) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, isFaceDown = false, onClick, className }) => {
  const cardBaseStyle = "w-36 h-52 md:w-40 md:h-60 rounded-lg shadow-xl border-2 p-2 flex flex-col justify-between transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer";
  const cardContentStyle = "text-xs overflow-y-auto max-h-20 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-purple-700";

  if (isFaceDown || !card) {
    const backColor = card?.type === CardType.Door || card?.type === CardType.Monster || card?.type === CardType.Curse || card?.type === CardType.Class || card?.type === CardType.Race ? "bg-blue-700 border-blue-400" : "bg-red-700 border-red-400";
    const text = card?.type === CardType.Door || card?.type === CardType.Monster || card?.type === CardType.Curse || card?.type === CardType.Class || card?.type === CardType.Race ? "DOOR" : "TREASURE";
    return (
      <div 
        className={`${cardBaseStyle} ${backColor} flex items-center justify-center ${className || ''}`}
        onClick={() => card && onClick && onClick(card.id)}
      >
        <span className="text-2xl font-bold text-yellow-300 transform rotate-12 game-font-applied">{text}</span>
      </div>
    );
  }

  let borderColor = 'border-yellow-400';
  let bgColor = 'bg-purple-800';

  switch (card.type) {
    case CardType.Monster:
      borderColor = 'border-red-500';
      bgColor = 'bg-red-900';
      break;
    case CardType.Curse:
      borderColor = 'border-green-500';
      bgColor = 'bg-green-900';
      break;
    case CardType.Item:
    case CardType.OneShot:
      borderColor = 'border-yellow-500';
      bgColor = 'bg-yellow-900';
      break;
    case CardType.Class:
    case CardType.Race:
      borderColor = 'border-blue-500';
      bgColor = 'bg-blue-900';
      break;
  }


  return (
    <div 
      className={`${cardBaseStyle} ${bgColor} ${borderColor} ${className || ''}`}
      onClick={() => onClick && onClick(card.id)}
    >
      <div className="flex-grow">
        <h3 className="text-sm font-bold text-yellow-300 mb-1 truncate game-font-applied">{card.name}</h3>
        {card.imageUrl && (
          <div className="w-full h-20 mb-1 bg-gray-700 rounded overflow-hidden">
            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
          </div>
        )}
        <p className={`${cardContentStyle} text-yellow-200`}>{card.description}</p>
      </div>
      <div className="mt-1 pt-1 border-t border-yellow-600 text-right">
        {card.bonus !== undefined && <p className="text-xs text-green-400">Bonus: +{card.bonus}</p>}
        {card.value !== undefined && <p className="text-xs text-yellow-400">Value: {card.value} GP</p>}
        {card.level !== undefined && <p className="text-xs text-red-400">Level: {card.level}</p>}
      </div>
    </div>
  );
};

export default Card;