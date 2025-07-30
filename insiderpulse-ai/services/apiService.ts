import { 
  AiAnalysisResult, 
  AnalysisModuleType, 
  CompanyProfile, 
  BacktestScenario, 
  BacktestResult, 
  SentimentAnalysisResult, 
  FinancialNewsArticle, 
  FinancialVideo, 
  LiveEventCategory, 
  StockData, 
  MarketIndex, 
  InitialDashboardData, 
  WatchlistPriceData 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // News & Dashboard
  async getInitialDashboardData(): Promise<InitialDashboardData> {
    return this.request<InitialDashboardData>('/news/dashboard');
  }

  async getFinancialNews(category: FinancialNewsArticle['category'] | 'Todo' = 'Todo'): Promise<FinancialNewsArticle[]> {
    const params = category !== 'Todo' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<FinancialNewsArticle[]>(`/news${params}`);
  }

  // Stock Data
  async getStockData(ticker: string): Promise<StockData | null> {
    try {
      return await this.request<StockData>(`/stocks/${ticker.toUpperCase()}`);
    } catch (error) {
      console.error(`Error fetching stock data for ${ticker}:`, error);
      return null;
    }
  }

  async getWatchlistPrices(tickers: string[]): Promise<WatchlistPriceData[]> {
    if (tickers.length === 0) return [];
    
    return this.request<WatchlistPriceData[]>('/stocks/watchlist/prices', {
      method: 'POST',
      body: JSON.stringify({ tickers }),
    });
  }

  async getMarketIndices(region: 'US' | 'Europe' | 'Asia' | 'Cryptos'): Promise<MarketIndex[]> {
    return this.request<MarketIndex[]>(`/stocks/indices/${region}`);
  }

  // AI Analysis
  async getAiAnalysis(companyData: CompanyProfile, analysisType: AnalysisModuleType): Promise<AiAnalysisResult> {
    return this.request<AiAnalysisResult>('/analysis/ai', {
      method: 'POST',
      body: JSON.stringify({
        ticker: companyData.ticker,
        name: companyData.name,
        analysisType,
      }),
    });
  }

  async getNewsAndSentimentAnalysis(company: CompanyProfile): Promise<SentimentAnalysisResult> {
    return this.request<SentimentAnalysisResult>('/analysis/sentiment', {
      method: 'POST',
      body: JSON.stringify({
        ticker: company.ticker,
        name: company.name,
      }),
    });
  }

  async runBacktestAnalysis(scenario: BacktestScenario): Promise<BacktestResult> {
    return this.request<BacktestResult>('/analysis/backtest', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  }

  async getRetirementAnalysis(inputs: {
    currentAge: number;
    retirementAge: number;
    monthlyContribution: number;
    finalAmount: number;
  }): Promise<string> {
    return this.request<string>('/analysis/retirement', {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  // Content
  async getFinancialVideos(): Promise<FinancialVideo[]> {
    return this.request<FinancialVideo[]>('/content/videos');
  }

  async getLiveMarketEvents(): Promise<LiveEventCategory[]> {
    return this.request<LiveEventCategory[]>('/content/events');
  }
}

export const apiService = new ApiService();

// Export individual functions for backward compatibility
export const getInitialDashboardData = () => apiService.getInitialDashboardData();
export const getFinancialNews = (category?: FinancialNewsArticle['category'] | 'Todo') => apiService.getFinancialNews(category);
export const getStockData = (ticker: string) => apiService.getStockData(ticker);
export const getWatchlistPrices = (tickers: string[]) => apiService.getWatchlistPrices(tickers);
export const getMarketIndices = (region: 'US' | 'Europe' | 'Asia' | 'Cryptos') => apiService.getMarketIndices(region);
export const getAiAnalysis = (companyData: CompanyProfile, analysisType: AnalysisModuleType) => apiService.getAiAnalysis(companyData, analysisType);
export const getNewsAndSentimentAnalysis = (company: CompanyProfile) => apiService.getNewsAndSentimentAnalysis(company);
export const runBacktestAnalysis = (scenario: BacktestScenario) => apiService.runBacktestAnalysis(scenario);
export const getRetirementAnalysis = (inputs: any) => apiService.getRetirementAnalysis(inputs);
export const getFinancialVideos = () => apiService.getFinancialVideos();
export const getLiveMarketEvents = () => apiService.getLiveMarketEvents();