export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

export interface CompanyProfile {
  ticker: string;
  name: string;
}

export interface SentimentAnalysisResult {
  overallSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keyTakeaways: string;
  articles: NewsArticle[];
}

export interface NewsArticle {
  title: string;
  summary: string;
  uri: string;
  source: string;
}

export interface FinancialNewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: 'Mercados' | 'Tecnología' | 'Economía' | 'Cripto' | 'Opinión' | 'Global';
}

export interface MarketIndex {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface StockData {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: Record<string, ChartDataPoint[]>;
  keyStats: Record<string, string>;
  news: StockNewsArticle[];
  conversations: ConversationPost[];
  options: {
    calls: OptionContract[];
    puts: OptionContract[];
  };
  components: IndexComponent[];
  historicalData: HistoricalDataRow[];
}

export interface ChartDataPoint {
  time: string;
  price: number;
  volume?: number;
}

export interface StockNewsArticle {
  id: string;
  source: string;
  time: string;
  headline: string;
  summary: string;
  url: string;
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

export interface HistoricalDataRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinancialVideo {
  id: string;
  title: string;
  channel: string;
  summary: string;
  videoId: string;
  publishedTime: string;
  imageUrl: string;
}

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