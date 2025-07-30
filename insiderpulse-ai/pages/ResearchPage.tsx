import React, { useState, useCallback, useRef } from 'react';
import { CompanyProfile, ComprehensiveAnalysisResult, AnalysisModuleType, SentimentAnalysisResult, SearchHistoryItem } from '../types';
import { sp500companies } from '../constants';
import { getAiAnalysis, getNewsAndSentimentAnalysis } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

import AppHeader from '../components/AppHeader';
import LiveAlertsTicker from '../components/LiveAlertsTicker';
import Pricing from '../components/Pricing';
import ComprehensiveAnalysis from '../components/ComprehensiveAnalysis';
import Backtesting from '../components/Backtesting';
import NewsAndSentiment from '../components/NewsAndSentiment';
import HistoryPanel from '../components/HistoryPanel';
import SP500Explorer from '../components/SP500Explorer';
import { Search } from '../components/IconComponents';
import Footer from '../components/Footer';

const companyNames: Record<string, string> = sp500companies.reduce((acc, company) => {
    acc[company.ticker] = company.name;
    return acc;
}, {} as Record<string, string>);

interface ResearchPageProps {
  onSelectTicker: (ticker: string) => void;
}

export default function ResearchPage({ onSelectTicker }: ResearchPageProps) {
  const [searchTicker, setSearchTicker] = useState('');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [analyses, setAnalyses] = useState<ComprehensiveAnalysisResult>({});
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState<Partial<Record<AnalysisModuleType, boolean>>>({});
  const [sentimentLoading, setSentimentLoading] = useState(false);
  
  const { history, addToHistory } = useAppContext();
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  
  const searchIdRef = useRef(0);

  const handleSearch = useCallback(async (tickerToSearch: string) => {
    const ticker = tickerToSearch.toUpperCase().trim();
    if (!ticker) return;

    // Increment and store the current search ID to prevent race conditions
    searchIdRef.current += 1;
    const currentSearchId = searchIdRef.current;

    setLoading(true);
    setSearched(true);
    setCompanyProfile(null);
    setAnalyses({});
    setSentimentAnalysis(null);
    setAnalysisLoading({});
    setSentimentLoading(false);
    setIsHistoryPanelOpen(false);
    document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });

    const companyName = companyNames[ticker] || `${ticker} Company`;
    const profile: CompanyProfile = { ticker, name: companyName };
    
    setCompanyProfile(profile);
    addToHistory(profile);
    
    // Run all analyses concurrently
    const analysisTypes = Object.values(AnalysisModuleType);
    const initialLoadingState = Object.fromEntries(analysisTypes.map(t => [t, true]));
    setAnalysisLoading(initialLoadingState);
    setSentimentLoading(true);

    analysisTypes.forEach(async (type) => {
        const analysis = await getAiAnalysis(profile, type);
        if (searchIdRef.current === currentSearchId) {
            setAnalyses(prev => ({ ...prev, [type]: analysis }));
            setAnalysisLoading(prev => ({ ...prev, [type]: false }));
        }
    });

    const sentiment = await getNewsAndSentimentAnalysis(profile);
    if (searchIdRef.current === currentSearchId) {
        setSentimentAnalysis(sentiment);
        setSentimentLoading(false);
    }
    
    // Only stop the main loading indicator if this is the latest search
    if (searchIdRef.current === currentSearchId) {
        setLoading(false);
    }
  }, [addToHistory]);

  const handleSelectAndSearch = (ticker: string) => {
    setSearchTicker(ticker);
    handleSearch(ticker);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <main className="max-w-7xl mx-auto px-2 sm:px-6 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Detecta <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Riesgos Ocultos</span> Antes Que Nadie
            </h2>
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-4xl mx-auto">
              Nuestra IA audita empresas en 5 vectores de riesgo y analiza las noticias en tiempo real para darte una ventaja competitiva.
            </p>
            
            <div className="flex max-w-md mx-auto mb-8">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                 <input
                    type="text"
                    placeholder="Buscar empresa (e.g., NFLX, NVDA)"
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTicker)}
                    className="w-full h-full px-12 py-3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-l-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400 transition-colors"
                  />
              </div>
              <button
                onClick={() => handleSearch(searchTicker)}
                disabled={loading && !companyProfile}
                className="w-24 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-r-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(loading && !companyProfile) ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Buscar"
                )}
              </button>
            </div>

            <LiveAlertsTicker onSelectTicker={onSelectTicker} />
          </div>
          
          <div id="analysis-results" className="space-y-8">
            {companyProfile && (
              <>
                <NewsAndSentiment 
                  result={sentimentAnalysis}
                  loading={sentimentLoading}
                  company={companyProfile}
                />
                <ComprehensiveAnalysis 
                  company={companyProfile}
                  analyses={analyses}
                  loadingStates={analysisLoading}
                />
              </>
            )}
            
            {!loading && searched && !companyProfile && (
              <div className="text-center py-12 text-white/70 bg-black/20 rounded-lg">No se encontraron datos para la empresa solicitada.</div>
            )}
            
            {!searched && !loading && (
              <SP500Explorer onSelectTicker={handleSelectAndSearch} />
            )}
          </div>

          <Backtesting />
          
          <Pricing />
        </main>
      </div>
      <Footer />
    </div>
  );
}