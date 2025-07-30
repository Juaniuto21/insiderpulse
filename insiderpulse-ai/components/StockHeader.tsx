import React from 'react';
import { Star } from './IconComponents';
import { useAppContext } from '../context/AppContext';

interface StockHeaderProps {
    stock: any;
}

const StockHeader: React.FC<StockHeaderProps> = ({ stock }) => {
    const { watchlist, addToWatchlist, removeFromWatchlist } = useAppContext();
    const isWatched = watchlist.some(item => item.ticker === stock.ticker);

    const handleFollowClick = () => {
        if (isWatched) {
            removeFromWatchlist(stock.ticker);
        } else {
            addToWatchlist({ ticker: stock.ticker, name: stock.name });
        }
    };

    return (
        <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Opciones de Chicago - Cotización retrasada • Dólar estadounidense</p>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white">{stock.name} ({stock.ticker})</h1>
                    <button 
                        onClick={handleFollowClick}
                        className="flex items-center gap-2 text-sm border border-gray-600 rounded-full px-3 py-1 text-gray-300 hover:text-white hover:border-white transition-colors"
                    >
                        <Star className={`w-4 h-4 ${isWatched ? 'text-yellow-400 fill-current' : ''}`} />
                        {isWatched ? 'Siguiendo' : 'Seguir'}
                    </button>
                </div>
            </div>
            <div className="flex items-end gap-3">
                <p className={`text-4xl font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className={`text-xl font-semibold leading-snug pb-1 ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">A las 11:56:54 AM EDT. Mercado abierto.</p>
        </div>
    );
};

export default StockHeader;