
import React from 'react';
import Button from '../components/Button';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="p-8 bg-purple-800 bg-opacity-70 rounded-xl shadow-2xl border-4 border-yellow-400 w-full max-w-md animate-fadeIn game-font-applied">
      <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">Game Settings & Options</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-1">Master Volume:</label>
          <input type="range" min="0" max="100" defaultValue="75" className="w-full h-3 bg-purple-600 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
        </div>
        <div>
          <label className="block text-yellow-400 text-sm font-bold mb-1">Animation Speed:</label>
          <select className="bg-purple-700 border-2 border-yellow-500 text-yellow-200 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5">
            <option>Slow & Steady</option>
            <option>Normal & Snappy</option>
            <option>Fast & Furious</option>
          </select>
        </div>
        <div className="flex items-center">
          <input id="game-sounds" type="checkbox" className="form-checkbox h-5 w-5 text-yellow-500 bg-purple-900 border-purple-500 rounded focus:ring-yellow-400 focus:ring-offset-purple-800" />
          <label htmlFor="game-sounds" className="ml-2 text-yellow-200">Enable Game Sound Effects</label>
        </div>
      </div>

      <p className="text-purple-300 italic mt-6 text-center">More settings coming soon... perhaps!</p>

      <div className="mt-8 text-center">
        <Button onClick={onBack} variant="secondary" size="lg">
          Back to Adventure
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;