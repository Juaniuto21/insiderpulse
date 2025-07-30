import React from 'react';
import { StockNewsArticle } from '../types';

interface StockNewsProps {
    news: StockNewsArticle[];
}

const StockNews: React.FC<StockNewsProps> = ({ news }) => {
    if (!news || news.length === 0) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center text-gray-500">
                No hay noticias recientes para este activo.
            </div>
        );
    }
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Noticias Recientes</h2>
            {news.map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block py-4 border-b border-white/10 last:border-0 hover:bg-white/5 -mx-4 px-4 rounded-md transition-colors"
                >
                    <p className="text-xs text-gray-500">{item.source} • {item.time}</p>
                    <h3 className="text-lg font-semibold text-white my-1 hover:text-emerald-400 transition-colors">{item.headline}</h3>
                    <p className="text-sm text-gray-400">{item.summary}</p>
                </a>
            ))}
        </div>
    );
};

export default StockNews;