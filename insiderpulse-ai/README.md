# InsiderPulse AI

InsiderPulse AI is a sophisticated financial intelligence dashboard designed to provide investors with a decisive edge. It goes beyond conventional news and market data by leveraging the power of Google's Gemini AI to analyze hidden risks, detect suspicious insider trading activity, and provide deep, multi-vector analysis of publicly traded companies.

## Core Features

### 1. Real-Time Financial News (`Noticias`)
- **AI-Powered Feed:** The news page is powered by a continuous feed of up-to-the-minute financial news, curated and summarized by the Gemini API.
- **Dynamic Content Grid:** Features a main story, a secondary "Latest" feed, and a grid of additional articles.
- **Interactive Filtering:** Users can filter news by categories such as 'Mercados', 'Tecnología', 'Economía', and 'Cripto' to focus on their interests.

### 2. Comprehensive Market & Stock Analysis (`Mercados`)
- **Fully Dynamic Data:** This is the core of the market analysis. When a ticker is selected, the app dynamically fetches a complete, real-time profile.
- **Interactive Charting:** Features a professional-grade, interactive stock chart with seamless switching between time ranges (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, All). Chart colors and axes adapt intelligently to the selected data.
- **In-Depth Information:** Provides key statistics, historical data tables, options chains (calls/puts), and a list of index components, all fetched on-demand.

### 3. Advanced AI Research & Risk Audit (`Investigación`)
- **Unified Analysis Flow:** Search for any US public company to initiate a deep-dive analysis.
- **5-Vector AI Risk Audit:** The AI performs a comprehensive audit across five critical, often overlooked, risk areas:
    - **Insider Trading:** Analyzes the patterns, timing, and significance of executive trades.
    - **Accounting Red Flags:** Scans for potential signs of financial manipulation.
    - **Supply Chain Risks:** Assesses dependencies, geopolitical threats, and logistical vulnerabilities.
    - **Patent Analysis:** Evaluates the strength and risk associated with a company's patent portfolio.
    - **Regulatory Risks:** Considers potential antitrust, privacy, and compliance issues.
- **Real-Time News & Sentiment Analysis:** Gemini reads and analyzes the latest news about the company to determine the overall market sentiment (Positive, Negative, Mixed) and provides key takeaways.

### 4. Live Intelligence & Alerts
- **Live Alerts Ticker:** A scrolling ticker on the Research page displays dynamically fetched, high-priority insider trading alerts as they happen.
- **Live Market Events (`Mira ahora`):** A dashboard that uses Gemini to find and display live or recent market-moving events, including Fed press conferences, key economic data releases, and top breaking news.
- **Live Market Clock:** The sidebar features a clock that accurately displays the US market status (open/closed) and a real-time countdown to the next event.

### 5. Personalization & Tools
- **Watchlist (`Mi portafolio`):** Users can add any stock to their personal watchlist to track performance. The watchlist icon provides a visual cue for any critical alerts related to the followed stocks.
- **Global Search:** A persistent, intelligent search bar allows for quick lookup of any S&P 500 company by ticker or name.
- **Retirement Calculator (`Finanzas personales`):** An interactive tool for users to project their retirement savings growth. It features an AI-powered analysis that provides personalized, general financial advice based on the user's inputs.
- **Curated Videos (`Videos`):** A page that dynamically fetches and displays a curated list of relevant and recent financial analysis videos from sources like YouTube.

## Technology Stack

- **Frontend:** React 19, TypeScript
- **Styling:** TailwindCSS
- **AI & Data:** Google Gemini API (`gemini-2.5-flash`) with Google Search grounding for real-time data fetching.
- **Charting:** Custom SVG-based charting components.
- **State Management:** React Context API for global state (Watchlist, Selected Ticker, History).
- **Icons:** Lucide React

## Setup and Running

To run this application, you need to have an API key for the Google Gemini API.

1.  **Environment Variable:** Create a `.env` file at the root of the project or set an environment variable for your deployment environment.
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

2.  **Dependencies:** The project uses `es-module-shims` and an import map, so there is no `npm install` step required for the browser to resolve dependencies.

3.  **Running:** Serve the `index.html` file using any simple static server.

---
*Disclaimer: InsiderPulse AI is an advanced analytics tool. All content is for informational purposes only and does not constitute financial advice. Always conduct your own research.*
