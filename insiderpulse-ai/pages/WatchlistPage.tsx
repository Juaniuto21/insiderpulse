import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Briefcase, Star, RefreshCw } from '../components/IconComponents';
import { getWatchlistPrices } from '../services/geminiService';
import { WatchlistPriceData, WatchlistItem } from '../types';

interface WatchlistPageProps {
    onSelectTicker: (ticker: string) => void;
}

const WatchlistItemRow: React.FC<{ item: WatchlistItem, priceData: WatchlistPriceData | undefined, onSelectTicker: (ticker: string) => void, onRemove: (ticker: string) => void }> = ({ item, priceData, onSelectTicker, onRemove }) => {

    const isPositive = (priceData?.change ?? 0) >= 0;

    return (
         <tr className="border-b border-white/10 hover:bg-white/5">
            <td className="px-6 py-4">
                <button onClick={() => onSelectTicker(item.ticker)} className="font-bold text-white hover:text-emerald-400 transition-colors">
                    {item.ticker}
                </button>
            </td>
            <td className="px-6 py-4">{item.name}</td>
            <td className="px-6 py-4 font-mono text-white">
                {priceData?.price?.toFixed(2) ?? '...'}
            </td>
            <td className={`px-6 py-4 font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {priceData?.change !== undefined ? `${isPositive ? '+' : ''}${priceData.change.toFixed(2)} (${priceData.changePercent?.toFixed(2)}%)` : '...'}
            </td>
            <td className="px-6 py-4 text-right">
                <button onClick={() => onRemove(item.ticker)} className="text-gray-500 hover:text-red-400 transition-colors" aria-label={`Remove ${item.name} from watchlist`}>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </button>
            </td>
        </tr>
    )
};

const SkeletonRow: React.FC = () => (
    <tr className="border-b border-gray-800 animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-40"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
        <td className="px-6 py-4 text-right"><div className="w-5 h-5 bg-gray-700 rounded-full inline-block"></div></td>
    </tr>
);


const WatchlistPage: React.FC<WatchlistPageProps> = ({ onSelectTicker }) => {
    const { watchlist, removeFromWatchlist } = useAppContext();
    const [priceData, setPriceData] = useState<Record<string, WatchlistPriceData>>({});
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (watchlist.length === 0) {
            setLoading(false);
            return;
        }

        const fetchPrices = async () => {
            setLoading(true);
            const tickers = watchlist.map(item => item.ticker);
            const prices = await getWatchlistPrices(tickers);
            
            const priceMap = prices.reduce((acc, curr) => {
                acc[curr.ticker] = curr;
                return acc;
            }, {} as Record<string, WatchlistPriceData>);

            setPriceData(priceMap);
            setLoading(false);
        };

        fetchPrices();
    }, [watchlist, key]);

    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

    return (
         <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                 <div>
                    <h1 className="text-4xl font-extrabold text-white flex items-center">
                        <Briefcase className="w-10 h-10 mr-4 text-emerald-400"/>
                        Mi portafolio / Watchlist
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">Una lista de los activos que estás siguiendo de cerca.</p>
                </div>
                 <button onClick={handleRefresh} disabled={loading} className="mt-4 sm:mt-0 flex items-center gap-2 text-sm border border-white/20 rounded-full px-4 py-2 text-gray-300 hover:text-white hover:border-white transition-colors disabled:opacity-50 disabled:cursor-wait">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar Precios'}
                </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10">
                {watchlist.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Tu watchlist está vacía.</p>
                        <p className="text-sm mt-2">Haz clic en el ícono de estrella <Star className="w-4 h-4 inline-block mx-1" /> en la página de un activo para añadirlo.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Símbolo</th>
                                    <th scope="col" className="px-6 py-3">Nombre</th>
                                    <th scope="col" className="px-6 py-3">Precio</th>
                                    <th scope="col" className="px-6 py-3">Cambio</th>
                                    <th scope="col" className="px-6 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading 
                                    ? watchlist.map(item => <SkeletonRow key={item.ticker}/>)
                                    : watchlist.map(item => (
                                        <WatchlistItemRow 
                                            key={item.ticker}
                                            item={item}
                                            priceData={priceData[item.ticker]}
                                            onSelectTicker={onSelectTicker}
                                            onRemove={removeFromWatchlist}
                                        />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;