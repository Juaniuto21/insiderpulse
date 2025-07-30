import React, { useState, useEffect } from 'react';
import MarketSidebar from '../components/MarketSidebar';
import StockPageNav from '../components/StockPageNav';
import StockHeader from '../components/StockHeader';
import StockChart from '../components/StockChart';
import KeyStats from '../components/KeyStats';
import StockNews from '../components/StockNews';
import StockConversations from '../components/StockConversations';
import StockHistoricalData from '../components/StockHistoricalData';
import StockOptions from '../components/StockOptions';
import StockComponents from '../components/StockComponents';
import { Page, StockSubPage, TimeRange, StockData } from '../types';
import { useAppContext } from '../context/AppContext';
import { getStockData } from '../services/geminiService';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface StockPageProps {
    navigateTo: (page: Page) => void;
    onSelectTicker: (ticker: string) => void;
}

const StockPageSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-8 w-3/4 bg-gray-800 rounded mb-2"></div>
        <div className="h-12 w-1/2 bg-gray-800 rounded mb-4"></div>
        <div className="h-[450px] bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 mb-4"></div>
        <div className="h-24 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10"></div>
    </div>
);


const StockPage: React.FC<StockPageProps> = ({ navigateTo, onSelectTicker }) => {
    const { selectedTicker } = useAppContext();
    const [activeSubPage, setActiveSubPage] = useState<StockSubPage>('Resumen');
    const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('1D');
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            setError(null);
            setStockData(null);
            try {
                const data = await getStockData(selectedTicker);
                if (data) {
                    setStockData(data);
                } else {
                    setError(`No se pudieron encontrar datos para ${selectedTicker}. Puede ser un ticker no válido o un problema de la API.`);
                }
            } catch (err) {
                setError("Ocurrió un error al cargar los datos del activo.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [selectedTicker]);

    const renderSubPage = () => {
        if (!stockData) return null;
        
        const chartDataForRange = stockData.chartData[activeTimeRange] || [];

        switch (activeSubPage) {
            case 'Resumen':
            case 'Cuadro':
                return (
                    <div className="space-y-6">
                        <StockChart 
                            data={chartDataForRange}
                            activeRange={activeTimeRange}
                            onSetRange={setActiveTimeRange}
                        />
                        <KeyStats stats={stockData.keyStats} />
                    </div>
                );
            case 'Noticias':
                return <StockNews news={stockData.news} />;
            case 'Conversaciones':
                return <StockConversations conversations={stockData.conversations} />;
            case 'Datos históricos':
                return <StockHistoricalData data={stockData.historicalData} />;
            case 'Opciones':
                return <StockOptions options={stockData.options} />;
            case 'Componentes':
                return <StockComponents components={stockData.components} onSelectTicker={onSelectTicker} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-[1360px] mx-auto px-2 md:px-4">
            <div className="grid grid-cols-12 gap-6">
                <nav className="hidden md:block col-span-2">
                    {stockData && <StockPageNav activeSubPage={activeSubPage} onNavigate={setActiveSubPage} />}
                </nav>
                <main className="col-span-12 md:col-span-7">
                    {loading && <StockPageSkeleton />}
                    {error && (
                         <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-8 rounded-xl text-center min-h-[500px] flex flex-col justify-center items-center">
                            <AlertCircle className="w-16 h-16 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Error al Cargar Activo</h2>
                            <p>{error}</p>
                        </div>
                    )}
                    {stockData && !loading && !error && (
                        <div className="space-y-6">
                            <StockHeader stock={stockData} />
                            <div className="md:hidden">
                                <StockPageNav activeSubPage={activeSubPage} onNavigate={setActiveSubPage} />
                            </div>
                            {renderSubPage()}
                        </div>
                    )}
                </main>
                <aside className="col-span-12 md:col-span-3">
                    <MarketSidebar navigateTo={navigateTo} onSelectTicker={onSelectTicker} />
                </aside>
            </div>
        </div>
    );
};

export default StockPage;