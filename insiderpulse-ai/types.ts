
export interface LiveAlert {
  ticker: string;
  action: string;
  executive: string;
  value: string;
  time: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface AiAnalysisResult {
  patternDetected: string;
  historicalContext: string;
  recommendation: string;
}

export enum AnalysisModuleType {
  INSIDER_TRADING = 'Insider Trading',
  ACCOUNTING_FLAGS = 'Accounting Red Flags',
  SUPPLY_CHAIN = 'Supply Chain Risks',
  PATENTS = 'Patent Analysis',
  REGULATORY_RISKS = 'Regulatory Risks',
}

export type ComprehensiveAnalysisResult = Partial<Record<AnalysisModuleType, AiAnalysisResult>>;

export interface CompanyProfile {
    ticker: string;
    name: string;
}

export interface BacktestScenario {
  id: string;
  ticker: string;
  companyName: string;
  eventDescription: string;
  eventDate: string;
  preEventDataSummary: string;
}

export interface BacktestResult {
  aiPrediction: string;
  aiReasoning: string;
  actualOutcome: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  uri: string;
  source: string;
}

export interface SentimentAnalysisResult {
  overallSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keyTakeaways: string;
  articles: NewsArticle[];
}

export interface SearchHistoryItem {
  ticker: string;
  name: string;
  viewedAt: number; // timestamp
}

// Types for News Page
export interface FinancialNewsArticle {
    id: string;
    headline: string;
    summary: string;
    source: string;
    url: string;
    imageUrl: string;
    category: 'Mercados' | 'Tecnología' | 'Economía' | 'Cripto' | 'Opinión' | 'Global';
}


// Types for Landing Page
export interface MarketIndex {
    name: string;
    ticker: string;
    value: number;
    change: number;
    changePercent: number;
}

export interface ActiveStock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface EarningEvent {
    date: string;
    ticker: string;
    time: 'BMO' | 'AMC'; // Before Market Open / After Market Close
}

// Types for Videos Page
export interface FinancialVideo {
    id: string;
    title: string;
    channel: string;
    summary: string;
    videoId: string;
    publishedTime: string;
    imageUrl: string;
}

// Types for Live Events Page
export interface LiveEvent {
    id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    isLive: boolean;
    time?: string;
}

export interface LiveEventCategory {
    categoryTitle: string;
    events: LiveEvent[];
}

// App Navigation
export const NAV_ITEMS = [
    "Noticias",
    "Mi portafolio",
    "Mercados",
    "Investigación",
    "Finanzas personales",
    "Videos",
    "Mira ahora"
] as const;

export type Page = typeof NAV_ITEMS[number];

// Types for Stock Detail Page
export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'AA' | '1A' | '5A' | 'Todo';

export interface ChartDataPoint {
    time: string;
    price: number;
    volume?: number;
}

export interface KeyStats {
    [key: string]: string | number;
}

export const STOCK_PAGE_NAV_ITEMS = [
    "Resumen", "Cuadro", "Conversaciones", "Noticias",
    "Datos históricos", "Opciones", "Componentes"
] as const;

export type StockSubPage = typeof STOCK_PAGE_NAV_ITEMS[number];

export interface StockNewsArticle {
    id: string;
    source: string;
    time: string;
    headline: string;
    summary: string;
    url: string;
}

export interface HistoricalDataRow {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ConversationPost {
    id: string;
    user: string;
    time: string;
    post: string;
    sentiment: 'Bullish' | 'Bearish';
}

export interface OptionContract {
    strike: number;
    lastPrice: number;
    bid: number;
    ask: number;
    change: number;
    percentChange: number;
    volume: number;
    openInterest: number;
}

export interface IndexComponent {
    name: string;
    symbol: string;
    weight: number;
}

// New type for Watchlist
export interface WatchlistItem {
    ticker: string;
    name: string;
}

// New comprehensive type for dynamic stock data
export interface StockData {
    name: string;
    ticker: string;
    price: number;
    change: number;
    changePercent: number;
    chartData: Record<TimeRange, ChartDataPoint[]>;
    keyStats: KeyStats;
    news: StockNewsArticle[];
    conversations: ConversationPost[];
    options: {
        calls: OptionContract[];
        puts: OptionContract[];
    };
    components: IndexComponent[];
    historicalData: HistoricalDataRow[];
}

// New types for performance optimization
export interface WatchlistPriceData {
    ticker: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface InitialDashboardData {
    liveAlerts: LiveAlert[];
    marketIndices: MarketIndex[];
    news: FinancialNewsArticle[];
}