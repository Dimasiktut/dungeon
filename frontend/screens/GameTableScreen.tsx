import React from 'react';
import { GameState, Player, Card as CardData, CardType, TurnPhase } from '../types';
import Button from '../components/Button';
import CardComponent from '../components/Card';
import PlayerAvatar from '../components/PlayerAvatar';

interface GameTableScreenProps {
  gameState: GameState;
  localPlayerId: string;
  onKickOpenDoor: () => void;
  onResolveDoorCard: (action: 'takeToHand' | 'applyCurse' | 'fightMonster' | 'playImmediately') => void;
  onLootRoom: () => void;
  onPlayCardFromHand: (cardId: string) => void;
  onEndTurn: () => void;
  onExitGame: () => void;
}

const GameTableScreen: React.FC<GameTableScreenProps> = ({ 
  gameState, 
  localPlayerId, 
  onKickOpenDoor,
  onResolveDoorCard,
  onLootRoom,
  onPlayCardFromHand,
  onEndTurn,
  onExitGame
}) => {
  const { players, currentPlayerId, doorDeck, treasureDeck, doorDiscard, treasureDiscard, turnPhase, currentEncounterCard, activeMonster, log } = gameState;
  const localPlayer = players.find(p => p.id === localPlayerId);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const otherPlayers = players.filter(p => p.id !== localPlayerId);

  if (!localPlayer || !currentPlayer) {
    return <div className="text-red-500">Ошибка: данные игрока отсутствуют!</div>;
  }

  const isMyTurn = currentPlayerId === localPlayerId;

  const renderActionButtons = () => {
    if (!isMyTurn) return <p className="text-lg text-gray-400 italic">Ожидание хода {currentPlayer.name}...</p>;

    switch (turnPhase) {
      case TurnPhase.KickOpenDoor:
        return <Button onClick={onKickOpenDoor} variant="primary" size="lg">Пнуть дверь!</Button>;

      case TurnPhase.ResolveDoorCard:
        if (!currentEncounterCard) return <p>Ожидание карты...</p>;
        switch (currentEncounterCard.type) {
          case CardType.Monster:
            return <Button onClick={() => onResolveDoorCard('fightMonster')} variant="danger" size="lg">Сразиться: {currentEncounterCard.name}!</Button>;
          case CardType.Curse:
            return <Button onClick={() => onResolveDoorCard('applyCurse')} variant="warning" size="lg">Проклятье: {currentEncounterCard.name}</Button>;
          default:
            return (
              <div className="flex flex-col space-y-2">
                <Button onClick={() => onResolveDoorCard('takeToHand')} variant="primary">В руку: {currentEncounterCard.name}</Button>
              </div>
            );
        }

      case TurnPhase.LootTheRoom:
        return <Button onClick={onLootRoom} variant="primary" size="lg">Обобрать комнату</Button>;

      case TurnPhase.LookingForTrouble:
      case TurnPhase.Charity:
        return <Button onClick={onEndTurn} variant="secondary" size="lg">Завершить ход</Button>;

      default:
        return <p>Неизвестная фаза: {turnPhase}</p>;
    }
  };

  const getTurnPhaseDescription = () => {
    if (!isMyTurn && currentPlayer) return `${currentPlayer.name} сейчас: ${turnPhase.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    switch (turnPhase) {
      case TurnPhase.KickOpenDoor: return "Твой ход! Пни дверь!";
      case TurnPhase.ResolveDoorCard: return `Разберись с картой: ${currentEncounterCard?.name || 'Неизвестно'}`;
      case TurnPhase.Combat: return `Битва с ${activeMonster?.name || 'монстром'}!`;
      case TurnPhase.LootTheRoom: return "Хапай добычу!";
      case TurnPhase.LookingForTrouble: return "Ищи неприятности или завершай ход.";
      case TurnPhase.Charity: return "Благотворительность: сбрось лишнее до 5 карт.";
      default: return turnPhase.replace(/([A-Z])/g, ' $1');
    }
  };

  return (
    <div className="p-2 md:p-4 bg-green-900 bg-opacity-80 rounded-xl shadow-2xl border-4 border-yellow-600 w-full max-w-7xl h-[95vh] flex flex-col text-yellow-200 game-font-applied animate-fadeIn overflow-hidden">
      {/* Верхняя панель */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 md:mb-4 px-1 sm:px-2">
        <div className="flex flex-wrap justify-center sm:justify-start space-x-1 md:space-x-2 mb-2 sm:mb-0">
          {otherPlayers.map(player => (
            <PlayerAvatar key={player.id} player={player} isCurrentPlayer={player.id === currentPlayerId} size="sm" />
          ))}
        </div>
        <div className="text-center flex-grow mx-2 my-1 sm:my-0">
          <h2 className="text-lg md:text-xl font-bold text-yellow-300">
            Ходит {currentPlayer.name} (уровень {currentPlayer.level})
          </h2>
          <p className="text-sm md:text-base text-orange-300 italic">{getTurnPhaseDescription()}</p>
        </div>
        <Button onClick={onExitGame} variant="danger" size="sm" className="flex-shrink-0">Выход</Button>
      </div>

      {/* Центр: игровая зона */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-2 md:mb-4 p-1 sm:p-2 md:p-4 bg-black bg-opacity-20 rounded-lg border-2 border-yellow-700 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-purple-800">
        <div className="flex flex-col items-center justify-start space-y-1 md:space-y-2 py-1 md:py-2 min-h-[280px] md:min-h-0">
          <h3 className="text-base md:text-lg font-semibold text-blue-400">Двери ({doorDeck.length})</h3>
          <CardComponent card={{id: 'doorDeck', name: 'Колода дверей', type: CardType.Door, description: ''}} isFaceDown={true} />
          <h3 className="text-xs md:text-sm font-semibold text-blue-300 mt-1">Сброс ({doorDiscard.length})</h3>
          <CardComponent card={doorDiscard.length > 0 ? doorDiscard[doorDiscard.length -1] : null} />
        </div>

        <div className="flex flex-col items-center justify-center bg-black bg-opacity-30 rounded-lg p-2 md:p-4 border border-red-600 space-y-2 md:space-y-3 min-h-[300px] md:min-h-0 order-first md:order-none">
          <h3 className="text-base md:text-lg font-semibold text-red-400 mb-1">Зона встречи</h3>
          <div className="flex-grow flex items-center justify-center">
            {currentEncounterCard && turnPhase === TurnPhase.ResolveDoorCard && <CardComponent card={currentEncounterCard} />}
            {activeMonster && turnPhase === TurnPhase.LootTheRoom && <CardComponent card={activeMonster} />}
            {!currentEncounterCard && !activeMonster && <div className="w-36 h-52 md:w-40 md:h-60 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 italic">Пусто</div> }
          </div>
          <div className="mt-auto pt-1 md:pt-2"> {renderActionButtons()}</div>
        </div>

        <div className="flex flex-col items-center justify-start space-y-1 md:space-y-2 py-1 md:py-2 min-h-[280px] md:min-h-0">
          <h3 className="text-base md:text-lg font-semibold text-yellow-400">Сокровища ({treasureDeck.length})</h3>
          <CardComponent card={{id: 'treasureDeck', name: 'Колода сокровищ', type: CardType.Treasure, description: ''}} isFaceDown={true} />
          <h3 className="text-xs md:text-sm font-semibold text-yellow-300 mt-1">Сброс ({treasureDiscard.length})</h3>
          <CardComponent card={treasureDiscard.length > 0 ? treasureDiscard[treasureDiscard.length -1] : null} />
        </div>
      </div>

      <div className="h-16 md:h-20 bg-black bg-opacity-40 p-2 rounded mb-1 md:mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-purple-700">
        <h4 className="text-sm font-semibold text-purple-300">Журнал событий:</h4>
        {log.slice().reverse().map((entry, index) => <p key={index} className="text-xs text-gray-300 leading-tight">{entry}</p>)}
      </div>

      <div className="bg-purple-900 bg-opacity-70 p-1 md:p-3 rounded-lg border-2 border-purple-500">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-1 md:mb-2">
          <PlayerAvatar player={localPlayer} isCurrentPlayer={isMyTurn} size="md" />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-semibold text-yellow-300 mb-1">Твоя рука ({localPlayer.cardsInHand.length} карт):</h3>
          <div className="flex space-x-1 md:space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-purple-700 min-h-[140px] md:min-h-[160px]">
            {localPlayer.cardsInHand.length > 0 ? localPlayer.cardsInHand.map(card => (
              <CardComponent 
                key={card.id} 
                card={card} 
                onClick={() => {
                  if (isMyTurn && (turnPhase === TurnPhase.LookingForTrouble || turnPhase === TurnPhase.KickOpenDoor || turnPhase === TurnPhase.Combat || turnPhase === TurnPhase.Charity )) { 
                    onPlayCardFromHand(card.id); 
                  }
                }}
                className="flex-shrink-0" 
              />
            )) : <p className="text-purple-300 italic p-4">Рука пуста.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTableScreen;