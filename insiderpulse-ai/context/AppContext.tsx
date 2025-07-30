
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { WatchlistItem, CompanyProfile, SearchHistoryItem, LiveAlert, InitialDashboardData } from '../types';
import { getInitialDashboardData } from '../services/geminiService';

interface AppContextType {
    watchlist: WatchlistItem[];
    addToWatchlist: (item: WatchlistItem) => void;
    removeFromWatchlist: (ticker: string) => void;
    selectedTicker: string;
    setSelectedTicker: (ticker: string) => void;
    history: SearchHistoryItem[];
    addToHistory: (item: CompanyProfile) => void;
    liveAlerts: LiveAlert[];
    loadingAlerts: boolean;
    initialDashboardData: InitialDashboardData | null;
    loadingDashboard: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [selectedTicker, setSelectedTicker] = useState<string>('^SPX');
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    
    const [initialDashboardData, setInitialDashboardData] = useState<InitialDashboardData | null>(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    useEffect(() => {
        try {
            const storedWatchlist = localStorage.getItem('insiderPulseWatchlist');
            if (storedWatchlist) {
                setWatchlist(JSON.parse(storedWatchlist));
            }
            const storedHistory = localStorage.getItem('insiderPulseHistory');
             if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to parse from localStorage", e);
            setWatchlist([]);
            setHistory([]);
        }
    }, []);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingDashboard(true);
            const data = await getInitialDashboardData();
            setInitialDashboardData(data);
            setLoadingDashboard(false);
        };
        fetchInitialData();
    }, []);

    const addToWatchlist = (item: WatchlistItem) => {
        setWatchlist(prev => {
            if (prev.some(i => i.ticker === item.ticker)) return prev;
            const newWatchlist = [...prev, item];
            localStorage.setItem('insiderPulseWatchlist', JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    };

    const removeFromWatchlist = (ticker: string) => {
        setWatchlist(prev => {
            const newWatchlist = prev.filter(i => i.ticker !== ticker);
            localStorage.setItem('insiderPulseWatchlist', JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    };
    
    const addToHistory = useCallback((item: CompanyProfile) => {
        setHistory(prevHistory => {
            const newHistory = [
                { ticker: item.ticker, name: item.name, viewedAt: Date.now() },
                ...prevHistory.filter(h => h.ticker !== item.ticker)
            ].slice(0, 20); 

            try {
                localStorage.setItem('insiderPulseHistory', JSON.stringify(newHistory));
            } catch (e) {
                console.error("Failed to save history to localStorage", e);
            }
            return newHistory;
        });
    }, []);

    const value = {
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        selectedTicker,
        setSelectedTicker,
        history,
        addToHistory,
        liveAlerts: initialDashboardData?.liveAlerts ?? [],
        loadingAlerts: loadingDashboard,
        initialDashboardData,
        loadingDashboard,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
