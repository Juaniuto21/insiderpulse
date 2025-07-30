import React from 'react';
import { Eye, History } from './IconComponents';

interface AppHeaderProps {
    onToggleHistory: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleHistory }) => {
  return (
    <header className="bg-black/40 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">InsiderPulse</h1>
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-full font-medium hidden sm:block">
              AI ANALYSIS
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-green-400 text-sm flex items-center hidden sm:flex">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Tracking 3,847 Executives
            </div>
            <button onClick={onToggleHistory} className="text-white/70 hover:text-white transition-colors" aria-label="Toggle search history">
              <History className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
