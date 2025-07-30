


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AiAnalysisResult, AnalysisModuleType, CompanyProfile, BacktestScenario, BacktestResult, SentimentAnalysisResult, NewsArticle, FinancialNewsArticle, FinancialVideo, LiveEventCategory, StockData, MarketIndex, LiveAlert, InitialDashboardData, WatchlistPriceData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for structured responses (unchanged)
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    patternDetected: { type: Type.STRING },
    historicalContext: { type: Type.STRING },
    recommendation: { type: Type.STRING }
  },
  required: ['patternDetected', 'historicalContext', 'recommendation']
};

const backtestSchema = {
  type: Type.OBJECT,
  properties: {
    aiPrediction: { type: Type.STRING },
    aiReasoning: { type: Type.STRING },
    actualOutcome: { type: Type.STRING }
  },
  required: ['aiPrediction', 'aiReasoning', 'actualOutcome']
};

const sentimentNewsSchema = {
    type: Type.OBJECT,
    properties: {
        overallSentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Mixed'] },
        keyTakeaways: { type: Type.STRING },
        articles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    source: { type: Type.STRING }
                },
                required: ['title', 'summary', 'source']
            }
        }
    },
    required: ['overallSentiment', 'keyTakeaways', 'articles']
};

const financialNewsSchema = {
    type: Type.OBJECT,
    properties: {
        news: {
            type: Type.ARRAY,
            description: "List of 10 financial news articles.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the article, e.g., 'news-1'" },
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    source: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['Mercados', 'Tecnología', 'Economía', 'Cripto', 'Opinión', 'Global'] },
                    imageUrlPrompt: { type: Type.STRING, description: "A 2-3 word prompt for an illustrative image, e.g., 'stock market chart'" }
                },
                required: ['id', 'headline', 'summary', 'source', 'category', 'imageUrlPrompt']
            }
        }
    },
    required: ['news']
}

const financialVideosSchema = {
    type: Type.OBJECT,
    properties: {
        videos: {
            type: Type.ARRAY,
            description: "List of 6-8 financial videos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    channel: { type: Type.STRING, description: "Name of the YouTube channel or source." },
                    summary: { type: Type.STRING, description: "A one-sentence summary." },
                    videoId: { type: Type.STRING, description: "The YouTube video ID." },
                    publishedTime: { type: Type.STRING, description: "e.g., '3 days ago', '1 week ago'" },
                    imageUrlPrompt: { type: Type.STRING, description: "A 2-3 word prompt for an illustrative image." }
                },
                required: ['id', 'title', 'channel', 'summary', 'videoId', 'publishedTime', 'imageUrlPrompt']
            }
        }
    },
    required: ['videos']
}

const liveEventsSchema = {
    type: Type.OBJECT,
    properties: {
        eventCategories: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    categoryTitle: { type: Type.STRING, description: "e.g., 'Transmisiones en Vivo', 'Calendario Económico (Hoy)', 'Noticias de Última Hora'" },
                    events: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                source: { type: Type.STRING },
                                isLive: { type: Type.BOOLEAN },
                                time: { type: Type.STRING, description: "Optional time, e.g., '14:30 EDT'" }
                            },
                            required: ['id', 'title', 'description', 'source', 'isLive']
                        }
                    }
                },
                required: ['categoryTitle', 'events']
            }
        }
    },
    required: ['eventCategories']
}

const retirementAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.STRING,
            description: "Provide a 3-4 sentence analysis with general advice based on the user's retirement planning inputs. Be encouraging and focus on key principles like consistency, diversification, and long-term perspective. Do not give specific financial advice."
        }
    },
    required: ['analysis']
};

const liveAlertsSchema = {
    type: Type.OBJECT,
    properties: {
        alerts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    ticker: { type: Type.STRING },
                    action: { type: Type.STRING },
                    executive: { type: Type.STRING },
                    value: { type: Type.STRING },
                    time: { type: Type.STRING },
                    risk: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM'] }
                },
                required: ['ticker', 'action', 'executive', 'value', 'time', 'risk']
            }
        }
    },
    required: ['alerts']
};

const marketIndexSchema = {
    type: Type.OBJECT,
    properties: {
        indices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    ticker: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    change: { type: Type.NUMBER },
                    changePercent: { type: Type.NUMBER },
                },
                 required: ['name', 'ticker', 'value', 'change', 'changePercent']
            }
        }
    },
    required: ['indices']
};

const stockDataSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        ticker: { type: Type.STRING },
        price: { type: Type.NUMBER },
        change: { type: Type.NUMBER },
        changePercent: { type: Type.NUMBER },
        keyStats: {
            type: Type.OBJECT,
            properties: {
                "Anterior Cerrar": { type: Type.STRING },
                "Volumen": { type: Type.STRING },
                "Rango de 52 semanas": { type: Type.STRING },
                "Abierto": { type: Type.STRING },
                "Rango del día": { type: Type.STRING },
                "Capitalización de Mercado": { type: Type.STRING }
            },
            required: ["Anterior Cerrar", "Volumen", "Rango de 52 semanas", "Abierto", "Rango del día", "Capitalización de Mercado"]
        },
        chartData: {
            type: Type.OBJECT,
            properties: {
                '1D': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                '5D': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                '1M': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                '6M': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                'AA': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                '1A': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                '5A': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } },
                'Todo': { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, price: { type: Type.NUMBER }, volume: { type: Type.NUMBER } }, required: ['time', 'price', 'volume'] } }
            },
            required: ['1D', '5D', '1M', '6M', 'AA', '1A', '5A', 'Todo']
        },
        news: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    source: { type: Type.STRING },
                    time: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    url: { type: Type.STRING },
                },
                required: ['id', 'source', 'time', 'headline', 'summary', 'url']
            }
        },
        conversations: {
            type: Type.ARRAY,
            description: "A list of recent conversation posts about the stock. Can be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    user: { type: Type.STRING },
                    time: { type: Type.STRING },
                    post: { type: Type.STRING },
                    sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish'] }
                },
                required: ['id', 'user', 'time', 'post', 'sentiment']
            }
        },
        options: {
            type: Type.OBJECT,
            description: "Option contracts, can be empty arrays if not applicable.",
            properties: {
                calls: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { strike: { type: Type.NUMBER }, lastPrice: { type: Type.NUMBER }, bid: { type: Type.NUMBER }, ask: { type: Type.NUMBER }, change: { type: Type.NUMBER }, percentChange: { type: Type.NUMBER }, volume: { type: Type.NUMBER }, openInterest: { type: Type.NUMBER } },
                        required: ['strike', 'lastPrice', 'bid', 'ask', 'change', 'percentChange', 'volume', 'openInterest']
                    }
                },
                puts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { strike: { type: Type.NUMBER }, lastPrice: { type: Type.NUMBER }, bid: { type: Type.NUMBER }, ask: { type: Type.NUMBER }, change: { type: Type.NUMBER }, percentChange: { type: Type.NUMBER }, volume: { type: Type.NUMBER }, openInterest: { type: Type.NUMBER } },
                        required: ['strike', 'lastPrice', 'bid', 'ask', 'change', 'percentChange', 'volume', 'openInterest']
                    }
                }
            },
            required: ['calls', 'puts']
        },
        components: {
            type: Type.ARRAY,
            description: "If the asset is an index, list its top components. If it's a stock, this should be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    symbol: { type: Type.STRING },
                    weight: { type: Type.NUMBER, description: "Weight in percentage" }
                },
                required: ['name', 'symbol', 'weight']
            }
        },
        historicalData: {
            type: Type.ARRAY,
            description: "Table of historical data. Can be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: { date: { type: Type.STRING }, open: { type: Type.NUMBER }, high: { type: Type.NUMBER }, low: { type: Type.NUMBER }, close: { type: Type.NUMBER }, volume: { type: Type.NUMBER } },
                required: ['date', 'open', 'high', 'low', 'close', 'volume']
            }
        }
    },
    required: ['name', 'ticker', 'price', 'change', 'changePercent', 'keyStats', 'chartData', 'news', 'conversations', 'options', 'components', 'historicalData']
};

const initialDashboardSchema = {
    type: Type.OBJECT,
    properties: {
        liveAlerts: liveAlertsSchema.properties.alerts,
        marketIndices: marketIndexSchema.properties.indices,
        news: financialNewsSchema.properties.news
    },
    required: ['liveAlerts', 'marketIndices', 'news']
};

const watchlistPricesSchema = {
    type: Type.OBJECT,
    properties: {
        prices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    ticker: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    change: { type: Type.NUMBER },
                    changePercent: { type: Type.NUMBER }
                },
                required: ['ticker', 'price', 'change', 'changePercent']
            }
        }
    },
    required: ['prices']
};


async function fetchAndFormat<T>(searchPrompt: string, formatInstruction: string, schema: any): Promise<{ data: T | null; sources: any[] }> {
    try {
        // Step 1: Search for information, get text response
        const searchResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: searchPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const searchResultText = searchResponse.text;
        const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        if (!searchResultText) {
            console.warn("Gemini search step returned no text for prompt:", searchPrompt);
            return { data: null, sources: [] };
        }

        // Step 2: Format the text into JSON
        const formatResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${formatInstruction}\n\nInformation:\n---\n${searchResultText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = formatResponse.text.trim();
        const data = JSON.parse(jsonText) as T;

        return { data, sources };

    } catch (error) {
        console.error("Error in fetchAndFormat process:", error);
        return { data: null, sources: [] };
    }
}


export const getInitialDashboardData = async (): Promise<InitialDashboardData> => {
    const searchPrompt = `
        You are a financial dashboard API. Use Google Search to get all the data needed for an initial dashboard view in a single pass.
        1.  **Live Alerts**: Find 5 recent and significant insider trading events.
        2.  **Market Indices**: Get the current market data for the main US indices (S&P 500, Dow 30, Nasdaq, Russell 2k, VIX).
        3.  **Financial News**: Find the top 10 most important financial news stories right now, with a mix from all categories. For each news story, provide an imageUrlPrompt.

        Present all this information as a well-structured text block.
    `;
    const formatInstruction = "Based on the provided text, generate a single, complete JSON object that strictly adheres to the schema, containing lists for liveAlerts, marketIndices, and news.";

    type GeminiFinancialNewsArticle = Omit<FinancialNewsArticle, 'url' | 'imageUrl'> & { imageUrlPrompt: string };
    type GeminiInitialData = Omit<InitialDashboardData, 'news'> & { news: GeminiFinancialNewsArticle[] };

    const { data, sources } = await fetchAndFormat<GeminiInitialData>(searchPrompt, formatInstruction, initialDashboardSchema);

    const emptyData: InitialDashboardData = { liveAlerts: [], marketIndices: [], news: [] };
    if (!data) return emptyData;

    const processedNews = (data.news || []).map((article, index) => {
        const { imageUrlPrompt, ...restOfArticle } = article;
        const bestUrl = sources.find(s => s.web.title?.toLowerCase().includes(article.headline.substring(0, 20).toLowerCase()))?.web?.uri;

        return {
            ...restOfArticle,
            url: bestUrl || sources[index]?.web?.uri || '#',
            imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(imageUrlPrompt)}`
        };
    });

    return {
        liveAlerts: data.liveAlerts || [],
        marketIndices: data.marketIndices || [],
        news: processedNews
    };
};

export const getWatchlistPrices = async (tickers: string[]): Promise<WatchlistPriceData[]> => {
    if (tickers.length === 0) return [];
    const searchPrompt = `Using Google Search, get the current stock price, absolute change, and percent change for the following tickers: ${tickers.join(', ')}. Present this as a clear text list.`;
    const formatInstruction = "Based on the provided text list of stock prices, format the data into a JSON object following the schema.";

    const { data } = await fetchAndFormat<{ prices: WatchlistPriceData[] }>(searchPrompt, formatInstruction, watchlistPricesSchema);
    return data?.prices || [];
};

export const getLiveAlerts = async (): Promise<LiveAlert[]> => {
    const searchPrompt = "Using Google Search, find 5 recent (last 24-48 hours) and significant insider trading events (buys or sells) for major US companies. Focus on large transactions or those made by high-level executives (CEO, CFO). For each, provide the ticker, a brief action description, the executive's name, the transaction value, how long ago it occurred, and a risk level (CRITICAL, HIGH, or MEDIUM). Present this as a clear text list.";
    const formatInstruction = "Based on the provided text list of insider trading events, format the data into a JSON object following the schema.";
    
    const { data } = await fetchAndFormat<{ alerts: LiveAlert[] }>(searchPrompt, formatInstruction, liveAlertsSchema);
    return data?.alerts || [];
};

export const getMarketIndices = async (region: 'US' | 'Europe' | 'Asia' | 'Cryptos'): Promise<MarketIndex[]> => {
    const searchPrompt = `Using Google Search, get the current market data for the main indices in the ${region} region.
- For US: S&P 500, Dow 30, Nasdaq, Russell 2k, VIX.
- For Europe: FTSE 100, DAX, CAC 40.
- For Asia: Nikkei 225, Hang Seng, Shanghai Composite.
- For Cryptos: Bitcoin, Ethereum, Solana, XRP.
Provide the name, ticker, current value, change, and percent change for each as a text list.`;
    const formatInstruction = "Based on the provided text list of market indices, format the data into a JSON object following the schema.";

    const { data } = await fetchAndFormat<{ indices: MarketIndex[] }>(searchPrompt, formatInstruction, marketIndexSchema);
    return data?.indices || [];
};


export const getStockData = async (ticker: string): Promise<StockData | null> => {
    const searchPrompt = `
        You are a financial data API. Use Google Search to get comprehensive, real-time data for the asset with ticker: ${ticker}.
        The asset could be a stock (like AAPL) or a major market index (like ^SPX, ^DJI). Be flexible.

        Gather the following information and present it as clear, well-structured text. If a piece of data is not available or not applicable (e.g., options for an index), state that clearly.
        - The asset's name (e.g., Apple Inc. or S&P 500).
        - Current value/price, its change, and percent change.
        - Key statistics. Provide values for: "Anterior Cerrar", "Volumen", "Rango de 52 semanas", "Abierto", "Rango del día".
        - For "Capitalización de Mercado", provide the market cap if it's a stock. If it's an index, provide "N/A".
        - Realistic historical price and volume data for ALL specified time ranges ('1D', '5D', '1M', '6M', 'AA', '1A', '5A', 'Todo'). The '1D' data should have timestamps (e.g., "10:00 AM"), while others should have dates (e.g., "2024-07-29"). The data must be plausible.
        - 2-3 recent, relevant news articles about the asset, including an id, source, time, headline, summary, and a valid URL.
        - A few sample conversation posts (bullish/bearish).
        - A few sample call and put option contracts for a near-term expiration date.
        - A table of recent historical daily data (date, open, high, low, close, volume).
        - If the asset is an index (like ^SPX), find its top 5-10 component companies by weight, including their name, symbol, and weight percentage. If it is not an index, this list should be empty.
    `;
    const formatInstruction = `Based on the following financial data for ${ticker}, generate a complete JSON object that strictly adheres to the provided schema. It is critical that you return a complete and valid JSON object. If a specific piece of data is not available or applicable (e.g. conversations for an index, options for an index, or components for a stock), you MUST return an empty array or object for that field to satisfy the schema. For example, 'conversations: []' or 'options: { calls: [], puts: [] }' or 'components: []'. DO NOT omit any fields from the final JSON.`;

    try {
        const { data } = await fetchAndFormat<StockData>(searchPrompt, formatInstruction, stockDataSchema);
        return data;
    } catch (error) {
         console.error(`Error fetching stock data for ${ticker} from Gemini:`, error);
        return null;
    }
};


export const getFinancialNews = async (category: FinancialNewsArticle['category'] | 'Todo' = 'Todo'): Promise<FinancialNewsArticle[]> => {
    const categoryQuery = category === 'Todo'
        ? "with a mix from categories like 'Mercados', 'Tecnología', 'Economía', 'Cripto', 'Opinión', 'Global'"
        : `in the '${category}' category`;

    const searchPrompt = `
        You are a financial news editor AI. Use Google Search to find the top 10 most important financial news stories right now ${categoryQuery}.
        For each story, provide: a unique id, the headline, summary, source, a relevant category ('Mercados', 'Tecnología', 'Economía', 'Cripto', 'Opinión', 'Global'), and a 2-3 word prompt for an illustrative image.
        If a specific category was requested, ensure all returned articles belong to it.
        The first article should be the most significant story of the day. Present as a clear text list.
    `;
    const formatInstruction = "Based on the provided text list of news articles, format the data into a JSON object following the schema.";

    type GeminiFinancialNewsArticle = Omit<FinancialNewsArticle, 'url' | 'imageUrl'> & { imageUrlPrompt: string };
    const { data, sources } = await fetchAndFormat<{ news: GeminiFinancialNewsArticle[] }>(searchPrompt, formatInstruction, financialNewsSchema);

    if (!data || !data.news) return [];
    
    return data.news.map((article, index) => {
        const { imageUrlPrompt, ...restOfArticle } = article;
        const bestUrl = sources.find(s => s.web.title?.toLowerCase().includes(article.headline.substring(0, 20).toLowerCase()))?.web?.uri;

        return {
            ...restOfArticle,
            url: bestUrl || sources[index]?.web?.uri || '#',
            imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(imageUrlPrompt)}`
        };
    });
};

export const getFinancialVideos = async (): Promise<FinancialVideo[]> => {
    const searchPrompt = `
        You are a financial content curator AI. Use Google Search to find 8 popular and recent financial analysis videos from YouTube.
        Focus on topics like market analysis, stock reviews, and economic news.
        For each video, provide: id, title, channel, summary, YouTube videoId, publishedTime, and an imageUrlPrompt.
        Present as a clear text list.
    `;
    const formatInstruction = "Based on the provided text list of videos, format the data into a JSON object following the schema.";

    type GeminiFinancialVideo = Omit<FinancialVideo, 'imageUrl'> & { imageUrlPrompt: string };
    const { data } = await fetchAndFormat<{ videos: GeminiFinancialVideo[] }>(searchPrompt, formatInstruction, financialVideosSchema);
    
    if (!data || !data.videos) return [];

    return data.videos.map(video => {
        const { imageUrlPrompt, ...restOfVideo } = video;
        return {
            ...restOfVideo,
            imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(imageUrlPrompt)}`
        };
    });
}

export const getLiveMarketEvents = async (): Promise<LiveEventCategory[]> => {
    const searchPrompt = `
        You are a live market intelligence AI. Use Google Search to find real-time information about the current financial markets.
        Find information for these categories:
        1. 'Transmisiones en Vivo': Look for any ongoing live streams from major financial news outlets (like Bloomberg, Reuters, Yahoo Finance) about press conferences (e.g., Fed), or major company events.
        2. 'Calendario Económico (Hoy)': Find today's key economic data releases (e.g., CPI, PPI, jobless claims, GDP) and their results if available.
        3. 'Noticias de Última Hora': Find 2-3 major market-moving news headlines that broke in the last 1-2 hours.
        For each event, provide: id, title, description, source, isLive status, and optional time. Present this as a structured text list.
    `;
    const formatInstruction = "Based on the provided text list of live market events, format the data into a JSON object following the schema.";
    
    const { data, sources } = await fetchAndFormat<{ eventCategories: LiveEventCategory[] }>(searchPrompt, formatInstruction, liveEventsSchema);

    if (!data || !data.eventCategories) return [];

    let sourceIndex = 0;
    data.eventCategories.forEach(category => {
        category.events.forEach(event => {
            if (sources[sourceIndex]) {
                event.url = sources[sourceIndex].web.uri;
                sourceIndex++;
            } else {
                event.url = '#';
            }
        });
    });

    return data.eventCategories;
}


export const getRetirementAnalysis = async (inputs: {currentAge: number, retirementAge: number, monthlyContribution: number, finalAmount: number}): Promise<string> => {
    const prompt = `
        A user is planning for retirement with the following scenario:
        - Current Age: ${inputs.currentAge}
        - Desired Retirement Age: ${inputs.retirementAge}
        - Monthly Contribution: $${inputs.monthlyContribution}
        - Estimated final savings: $${inputs.finalAmount.toLocaleString()}
        
        Based on this, provide a short, encouraging, and general analysis (3-4 sentences). Do NOT give specific financial advice.
        Focus on principles like the power of compound interest, the importance of consistent contributions, and maintaining a long-term perspective.
        Generate a JSON response following the schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: retirementAnalysisSchema,
            },
        });
        const result = JSON.parse(response.text.trim());
        return result.analysis || "Could not generate analysis.";
    } catch (error) {
        console.error("Error fetching retirement analysis:", error);
        return "AI analysis is currently unavailable.";
    }
}


// Existing Functions (Unchanged or minor tweaks)

const getPromptForType = (companyData: CompanyProfile, analysisType: AnalysisModuleType): string => {
  const basePrompt = `
    You are a world-class financial analyst. Your task is to provide a detailed text-based analysis for ${companyData.name} (${companyData.ticker}) using the latest information.
    If you find low risk, it is crucial that you explain WHAT positive indicators you see and WHY they are positive. The user is paying for this justification.
  `;

  switch(analysisType) {
    case AnalysisModuleType.INSIDER_TRADING:
      return `${basePrompt}
        Analysis Topic: Insider Trading Patterns.
        Analyze the company's recent insider trading activity. Pay close attention to:
        1. The timing of trades relative to earnings reports.
        2. The positions of the executives.
        3. The volume and value of shares.
        4. Coordination among executives.
        Even if no suspicious patterns are found, explain why the trading activity appears normal or routine.
      `;
    
    case AnalysisModuleType.ACCOUNTING_FLAGS:
      return `${basePrompt}
        Analysis Topic: Accounting Red Flags.
        Analyze potential accounting red flags. Look for signs of revenue manipulation, unusual inventory levels, changes in accounting policies, or discrepancies between cash flow and net income. Assess the risk level based on these factors.
      `;

    case AnalysisModuleType.SUPPLY_CHAIN:
      return `${basePrompt}
        Analysis Topic: Supply Chain Risks.
        Analyze the supply chain risks. Consider key supplier dependencies, geopolitical risks in sourcing locations, logistics vulnerabilities, and inventory management strategies. Assess the company's resilience to disruptions.
      `;

    case AnalysisModuleType.PATENTS:
      return `${basePrompt}
        Analysis Topic: Patent Portfolio Analysis.
        Analyze the patent portfolio. Identify key patents, their importance to revenue, and their expiration dates. Assess the risk of losing competitive advantage due to patent expirations, litigation, or lack of innovation.
      `;

    case AnalysisModuleType.REGULATORY_RISKS:
      return `${basePrompt}
        Analysis Topic: Regulatory Risks.
        Analyze the regulatory risks facing the company. Consider potential antitrust lawsuits, data privacy regulations (like GDPR), environmental compliance, and industry-specific regulations. Assess the likelihood and potential financial impact of regulatory penalties.
      `;

    default:
      return basePrompt;
  }
}

export const getAiAnalysis = async (companyData: CompanyProfile, analysisType: AnalysisModuleType): Promise<AiAnalysisResult> => {
    const searchPrompt = getPromptForType(companyData, analysisType);
    const formatInstruction = `Based on the provided text analysis, create a structured JSON object. Extract the key "pattern detected", the "historical context", and the final "recommendation" into the fields of the JSON object, following the schema.`;

    try {
        const { data } = await fetchAndFormat<AiAnalysisResult>(searchPrompt, formatInstruction, analysisSchema);
        if (data) {
            return data;
        }
        throw new Error("Formatted data was null");
    } catch (error) {
        console.error(`Error fetching AI analysis for ${analysisType} from Gemini:`, error);
        return {
            patternDetected: `AI analysis for ${analysisType} could not be completed.`,
            historicalContext: "There was an error connecting to the AI service. Please check your API key and network connection.",
            recommendation: "Unable to provide a recommendation at this time."
        };
    }
};

export const runBacktestAnalysis = async (scenario: BacktestScenario): Promise<BacktestResult> => {
    const prompt = `
      You are an AI financial analyst performing a historical backtest. It is currently the date specified in the context.
      You MUST analyze the situation based ONLY on the data provided in the 'preEventDataSummary'. Do not use any knowledge of what actually happened after this date.
      Your task is to predict the likely outcome for ${scenario.companyName} (${scenario.ticker}).

      Scenario Details:
      - Company: ${scenario.companyName} (${scenario.ticker})
      - Historical Event to Predict: ${scenario.eventDescription}
      - Data available for your analysis (pre-event):
      ${scenario.preEventDataSummary}

      Based *only* on the information above, generate a JSON response following the provided schema, predicting the outcome.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: backtestSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BacktestResult;

    } catch (error) {
        console.error(`Error running backtest for ${scenario.ticker} from Gemini:`, error);
        return {
            aiPrediction: "Error: AI Backtest Failed",
            aiReasoning: "Could not generate a prediction due to a technical error with the AI service.",
            actualOutcome: "Analysis could not be completed."
        };
    }
}

export const getNewsAndSentimentAnalysis = async (company: CompanyProfile): Promise<SentimentAnalysisResult> => {
    const searchPrompt = `
        You are a financial news analyst AI. Use Google Search to find the most relevant news articles about ${company.name} (${company.ticker}) from the past 7-10 days.
        Analyze the articles and provide a text summary of the overall sentiment, key takeaways, and a list of the analyzed articles with their title, summary, and source.
        Focus on news that could impact stock price: earnings, product launches, executive changes, regulatory issues, M&A rumors, etc.
        Ignore stock price target changes unless they are tied to new, fundamental information.
    `;
    const formatInstruction = "Based on the provided text analysis of news and sentiment, format the data into a JSON object following the schema.";
    
    const { data, sources } = await fetchAndFormat<SentimentAnalysisResult>(searchPrompt, formatInstruction, sentimentNewsSchema);
        
    if (!data) {
         return {
            overallSentiment: "Neutral",
            keyTakeaways: "Could not fetch real-time news due to an API error. Sentiment analysis is unavailable.",
            articles: []
        };
    }

    if (data.articles && sources.length > 0) {
        data.articles.forEach((article, index) => {
            const matchingSource = sources.find(s => s.web?.title?.toLowerCase().includes(article.title.substring(0, 20).toLowerCase()));
            article.uri = matchingSource?.web?.uri || sources[index]?.web?.uri || '#';
        });
    }
    
    return data;
}
