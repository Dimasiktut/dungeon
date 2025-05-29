
import React from 'react';
import { Screen } from '../types';
import Button from '../components/Button';

interface MainMenuScreenProps {
  onNavigate: (screen: Screen) => void;
  onJoinRoom: () => void; 
  onExit: () => void;
}

const DoorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M2.25 3.75A.75.75 0 001.5 4.5v11.5c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75H2.25zM3 5.25v10h14V5.25H3z" clipRule="evenodd" />
    <path d="M9.5 11.75a.75.75 0 000-1.5H7.25V9.5a.75.75 0 00-1.5 0v2.25H9.5z" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
</svg>
);

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.566.379-1.566 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.566 2.6 1.566 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.566-.379 1.566-2.6 0-2.978a1.532 1.532 0 01.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const ExitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);


const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onNavigate, onJoinRoom, onExit }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-purple-800 bg-opacity-50 rounded-xl shadow-2xl border-4 border-yellow-400 w-full max-w-md animate-fadeIn game-font-applied">
      <h1 className="text-3xl font-bold text-yellow-300 mb-2 game-title-font drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">Лутай и Беги</h1>
      <p className="text-lg text-yellow-200 mb-8 italic">"Сразитесь с монстрами, соберите сокровища, перехитрите друзей!"</p>
      <div className="space-y-4 w-full">
        <Button onClick={() => onNavigate(Screen.CreateRoom)} variant="primary" size="lg" className="w-full" icon={<DoorIcon />}>
          Создать игру
        </Button>
        <Button onClick={onJoinRoom} variant="secondary" size="lg" className="w-full" icon={<UsersIcon />}>
          Подключиться к приключению
        </Button>
        <Button onClick={() => onNavigate(Screen.Settings)} variant="secondary" size="lg" className="w-full" icon={<CogIcon />}>
          Настройки
        </Button>
        <Button onClick={onExit} variant="danger" size="lg" className="w-full" icon={<ExitIcon />}>
          Выход
        </Button>
      </div>
      <p className="mt-8 text-xs text-purple-300">Развлекательная карточная игра</p>
    </div>
  );
};

export default MainMenuScreen;