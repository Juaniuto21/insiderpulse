import React, { useState, useCallback } from 'react';
import { Page } from './types';
import NewsPage from './pages/NewsPage';
import ResearchPage from './pages/ResearchPage';
import MainHeader from './components/MainHeader';
import StockPage from './pages/StockPage';
import VideosPage from './pages/VideosPage';
import WatchlistPage from './pages/WatchlistPage';
import PersonalFinancePage from './pages/PersonalFinancePage';
import LiveEventsPage from './pages/LiveEventsPage';
import { useAppContext } from './context/AppContext';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('Noticias');
  const { setSelectedTicker } = useAppContext();

  const handleNavigate = useCallback((page: Page) => {
    setActivePage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleSelectTickerAndNavigate = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
    handleNavigate('Mercados');
  }, [setSelectedTicker, handleNavigate]);

  const renderPage = () => {
      switch(activePage) {
          case 'Noticias':
              return <NewsPage navigateTo={handleNavigate} onSelectTicker={handleSelectTickerAndNavigate} />;
          case 'Investigación':
              return <ResearchPage onSelectTicker={handleSelectTickerAndNavigate} />;
          case 'Mercados':
              return <StockPage navigateTo={handleNavigate} onSelectTicker={handleSelectTickerAndNavigate} />;
          case 'Videos':
              return <VideosPage />;
          case 'Mi portafolio':
              return <WatchlistPage onSelectTicker={handleSelectTickerAndNavigate} />;
          case 'Finanzas personales':
               return <PersonalFinancePage />;
          case 'Mira ahora':
               return <LiveEventsPage />;
          default:
              return <NewsPage navigateTo={handleNavigate} onSelectTicker={handleSelectTickerAndNavigate} />;
      }
  }

  return (
    <div className="text-gray-200 min-h-screen">
      <MainHeader activePage={activePage} onNavigate={handleNavigate} onSelectTicker={handleSelectTickerAndNavigate} />
      <main>
          {renderPage()}
      </main>
    </div>
  );
}