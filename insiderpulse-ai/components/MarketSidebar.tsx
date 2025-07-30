import React, { useState, useEffect } from 'react';
import { Clock } from './IconComponents';
import Sparkline from './Sparkline';
import { Page, MarketIndex } from '../types';
import GlobalSearch from './GlobalSearch';
import useMarketStatus from '../hooks/useMarketStatus';
import { getMarketIndices } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

interface MarketSidebarProps {
    navigateTo: (page: Page) => void;
    onSelectTicker: (ticker: string) => void;
}

type MarketRegion = 'US' | 'Europe' | 'Asia' | 'Cryptos';

const MarketSidebar: React.FC<MarketSidebarProps> = ({ navigateTo, onSelectTicker }) => {
    const TABS: MarketRegion[] = ['US', 'Europe', 'Asia', 'Cryptos'];
    const [activeTab, setActiveTab] = useState<MarketRegion>('US');
    const { message, isOpen } = useMarketStatus();
    const { initialDashboardData, loadingDashboard } = useAppContext();
    
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndicesForRegion = async (region: MarketRegion) => {
            setLoading(true);
            const data = await getMarketIndices(region);
            setIndices(data);
            setLoading(false);
        };

        if (activeTab === 'US') {
            setLoading(loadingDashboard);
            if (initialDashboardData?.marketIndices) {
                setIndices(initialDashboardData.marketIndices);
            }
        } else {
            fetchIndicesForRegion(activeTab);
        }
    }, [activeTab, initialDashboardData, loadingDashboard]);
    
    const renderSkeletons = () => (
        [...Array(4)].map((_, i) => (
             <div key={i} className="bg-white/5 p-2 rounded-lg animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-700 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
        ))
    );

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-4">
            <GlobalSearch onSelectTicker={onSelectTicker} />
            
            <div className="flex items-center justify-center text-xs text-gray-400 space-x-2">
                <Clock className={`w-4 h-4 ${isOpen ? 'text-emerald-500' : 'text-yellow-500'}`} />
                <span>{message}</span>
            </div>

            <div className="flex items-center justify-between text-sm border-b border-white/10">
                {TABS.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-3 transition-colors w-full ${tab === activeTab ? 'text-white border-b-2 border-emerald-500 font-semibold' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                {loading ? renderSkeletons() : indices.map(index => (
                    <button 
                        key={index.name}
                        onClick={() => onSelectTicker(index.ticker)}
                        className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors text-left border border-transparent hover:border-white/20"
                    >
                        <p className="text-gray-300 truncate text-xs">{index.name}</p>
                        <p className="font-bold text-white text-base mt-1">{index.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p className={`text-xs font-mono ${index.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                        </p>
                    </button>
                ))}
            </div>

             <div className="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                <h4 className="font-bold text-white">Portfolio</h4>
                <p className="text-sm text-gray-400 my-2">Sign in to access your portfolio</p>
                <button 
                    onClick={() => navigateTo('Mi portafolio')}
                    className="w-full bg-emerald-500 text-black rounded py-2 text-sm font-bold hover:bg-emerald-600 transition"
                >
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default MarketSidebar;