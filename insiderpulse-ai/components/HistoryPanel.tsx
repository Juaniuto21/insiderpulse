import React from 'react';
import { SearchHistoryItem } from '../types';
import { History, X } from './IconComponents';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: SearchHistoryItem[];
    onSelectTicker: (ticker: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onSelectTicker }) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentHistory = history.filter(item => item.viewedAt > sevenDaysAgo);

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-l border-white/10 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        Historial (Últimos 7 días)
                    </h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    {recentHistory.length > 0 ? (
                        recentHistory.map(item => (
                            <button
                                key={item.ticker}
                                onClick={() => onSelectTicker(item.ticker)}
                                className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">{item.ticker}</div>
                                        <div className="text-sm text-white/60 truncate">{item.name}</div>
                                    </div>
                                    <div className="text-xs text-white/50">{timeAgo(item.viewedAt)}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center text-white/50 py-10">
                            Tu historial de búsqueda aparecerá aquí.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HistoryPanel;
