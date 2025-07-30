import React from 'react';
import { FinancialNewsArticle } from '../types';
import SecondaryNewsFeed from './SecondaryNewsFeed';

const NEWS_CATEGORIES: FinancialNewsArticle['category'][] = ['Mercados', 'Tecnología', 'Economía', 'Cripto', 'Opinión', 'Global'];

const MainStoryCard: React.FC<{ article: FinancialNewsArticle }> = ({ article }) => (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="relative block col-span-12 md:col-span-8 h-[500px] rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
        <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
            <span className="text-sm font-bold bg-emerald-500 px-3 py-1 rounded-full">{article.category}</span>
            <h2 className="text-4xl font-bold leading-tight mt-3">{article.headline}</h2>
            <p className="text-lg text-gray-300 mt-2 max-w-2xl">{article.summary}</p>
            <p className="text-sm text-gray-400 mt-4">{article.source}</p>
        </div>
    </a>
);

const BottomNewsCard: React.FC<{ article: FinancialNewsArticle }> = ({ article }) => (
     <a href={article.url} target="_blank" rel="noopener noreferrer" className="relative block rounded-xl overflow-hidden group h-64 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
        <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
            <span className="text-xs font-bold bg-emerald-500/80 px-2 py-0.5 rounded">{article.category}</span>
            <h3 className="font-bold text-lg mt-2">{article.headline}</h3>
            <p className="text-xs text-gray-300 mt-1">{article.source}</p>
        </div>
    </a>
);

const Skeleton: React.FC<{className?: string}> = ({className}) => <div className={`bg-gray-800/50 animate-pulse rounded-xl ${className}`}></div>

interface NewsGridProps {
    articles: FinancialNewsArticle[];
    isLoading: boolean;
    activeCategory: FinancialNewsArticle['category'] | 'Todo';
    onCategoryChange: (category: FinancialNewsArticle['category'] | 'Todo') => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({ articles, isLoading, activeCategory, onCategoryChange }) => {

    const renderGrid = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-12 gap-6">
                        <Skeleton className="col-span-12 md:col-span-8 h-[500px]" />
                        <Skeleton className="col-span-12 md:col-span-4 h-[500px]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            );
        }

        if (articles.length === 0) {
            return (
                <div className="text-center py-20 text-gray-500 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10">
                    <p>No hay noticias para la categoría seleccionada.</p>
                </div>
            );
        }

        const mainStory = articles[0];
        const secondaryFeedArticles = articles.slice(1, 6);
        const bottomGridArticles = articles.slice(6);

        return (
            <>
                <div className="grid grid-cols-12 gap-6">
                    <MainStoryCard article={mainStory} />
                    <div className="col-span-12 md:col-span-4">
                        <SecondaryNewsFeed articles={secondaryFeedArticles} />
                    </div>
                </div>
                {bottomGridArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {bottomGridArticles.map(article => (
                            <BottomNewsCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
                 <button 
                    onClick={() => onCategoryChange('Todo')}
                    className={`px-4 py-1.5 text-sm rounded-full transition-all ${activeCategory === 'Todo' ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20' : 'bg-gray-900/50 border border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                    Todo
                </button>
                {NEWS_CATEGORIES.map(cat => (
                     <button 
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`px-4 py-1.5 text-sm rounded-full transition-all ${activeCategory === cat ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20' : 'bg-gray-900/50 border border-white/10 text-gray-300 hover:bg-white/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            {renderGrid()}
        </div>
    );
};

export default NewsGrid;