import React from 'react';
import { Page, NAV_ITEMS } from '../types';
import { useAppContext } from '../context/AppContext';
import GlobalSearch from './GlobalSearch';

interface MainHeaderProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onSelectTicker: (ticker: string) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ activePage, onNavigate, onSelectTicker }) => {
    const { watchlist, liveAlerts } = useAppContext();

    const hasCriticalAlert = watchlist.some(watchlistItem => 
        liveAlerts.some(alert => alert.ticker === watchlistItem.ticker && alert.risk === 'CRITICAL')
    );

    return (
        <header className="bg-gray-950/70 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-[1360px] mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    <nav className="flex items-center space-x-6">
                        {NAV_ITEMS.map(item => (
                            <button 
                                key={item} 
                                onClick={() => onNavigate(item)}
                                className={`relative text-sm font-medium transition-colors duration-200 ${item === activePage ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {item}
                                {item === 'Mi portafolio' && hasCriticalAlert && (
                                    <span className="absolute top-0 right-[-8px] w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                )}
                                 {item === 'Mi portafolio' && hasCriticalAlert && (
                                    <span className="absolute top-0 right-[-8px] w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                                {item === activePage && <div className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full"></div>}
                            </button>
                        ))}
                    </nav>
                    <div className="w-full max-w-xs">
                        <GlobalSearch onSelectTicker={onSelectTicker} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;