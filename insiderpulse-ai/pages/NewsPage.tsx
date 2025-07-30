import React, { useState, useEffect } from 'react';
import NewsGrid from '../components/NewsGrid';
import MarketSidebar from '../components/MarketSidebar';
import { Page, FinancialNewsArticle } from '../types';
import { getFinancialNews } from '../services/apiService';
import { Newspaper } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NewsPageProps {
    navigateTo: (page: Page) => void;
    onSelectTicker: (ticker: string) => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ navigateTo, onSelectTicker }) => {
    const { initialDashboardData, loadingDashboard } = useAppContext();
    const [articles, setArticles] = useState<FinancialNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<FinancialNewsArticle['category'] | 'Todo'>('Todo');


    useEffect(() => {
        const fetchNewsForCategory = async (category: FinancialNewsArticle['category']) => {
            setLoading(true);
            setError(null);
            try {
                const newsData = await getFinancialNews(category);
                setArticles(newsData);
            } catch (err) {
                 setError("Ocurrió un error al contactar al servicio de noticias.");
                 console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (activeCategory === 'Todo') {
            setLoading(loadingDashboard);
            if (initialDashboardData?.news) {
                setArticles(initialDashboardData.news);
            }
        } else {
            fetchNewsForCategory(activeCategory);
        }
    }, [activeCategory, initialDashboardData, loadingDashboard]);


    return (
        <div className="max-w-[1360px] mx-auto px-2 sm:px-4">
            <div className="my-6">
                <h1 className="text-4xl font-extrabold text-white flex items-center">
                    <Newspaper className="w-10 h-10 mr-4 text-emerald-400"/>
                    Noticias Financieras
                </h1>
                <p className="mt-2 text-lg text-gray-400">Las últimas noticias y análisis del mercado global, impulsadas por IA.</p>
            </div>
             {error && <div className="text-center text-red-400 bg-red-500/20 p-4 rounded-md">{error}</div>}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9">
                    <NewsGrid 
                        articles={articles} 
                        isLoading={loading} 
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>
                <aside className="col-span-12 lg:col-span-3">
                    <MarketSidebar navigateTo={navigateTo} onSelectTicker={onSelectTicker}/>
                </aside>
            </div>
        </div>
    );
};

export default NewsPage;