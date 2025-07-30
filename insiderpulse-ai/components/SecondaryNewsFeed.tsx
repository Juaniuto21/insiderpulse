import React from 'react';
import { FinancialNewsArticle } from '../types';

const NewsFeedItem: React.FC<{ article: FinancialNewsArticle }> = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block py-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 px-2 -mx-2 rounded-md transition-colors">
        <h4 className="font-semibold text-sm text-gray-100 hover:text-white leading-tight">{article.headline}</h4>
        <div className="flex items-center text-xs text-gray-400 mt-1.5">
            <span>{article.source}</span>
             <span className="ml-auto font-mono text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">{article.category}</span>
        </div>
    </a>
);

interface SecondaryNewsFeedProps {
    articles: FinancialNewsArticle[];
}

const SecondaryNewsFeed: React.FC<SecondaryNewsFeedProps> = ({ articles }) => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 h-full">
            <h3 className="text-xl font-bold text-white mb-2 pb-2 border-b border-white/10">El último</h3>
            {articles.length > 0 ? (
                <div className="space-y-1">
                    {articles.map(article => (
                        <NewsFeedItem key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 text-gray-500 text-sm">
                    No hay más noticias.
                </div>
            )}
        </div>
    );
};

export default SecondaryNewsFeed;