# InsiderPulse AI Backend

A secure, scalable Node.js/Express API backend for the InsiderPulse AI financial dashboard.

## Features

- **AI-Powered Analysis**: Integration with Google Gemini AI for financial analysis
- **Comprehensive Security**: Rate limiting, input sanitization, security headers
- **Caching System**: Redis-like in-memory caching for performance
- **Structured Logging**: Winston-based logging with different levels
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Docker Support**: Production-ready containerization
- **Health Monitoring**: Built-in health checks and monitoring

## API Endpoints

### News & Dashboard
- `GET /api/v1/news` - Get financial news articles
- `GET /api/v1/news/dashboard` - Get initial dashboard data

### Stock Data
- `GET /api/v1/stocks/:ticker` - Get comprehensive stock data
- `POST /api/v1/stocks/watchlist/prices` - Get prices for multiple tickers
- `GET /api/v1/stocks/indices/:region` - Get market indices

### AI Analysis
- `POST /api/v1/analysis/ai` - Get AI analysis for a company
- `POST /api/v1/analysis/sentiment` - Get sentiment analysis
- `POST /api/v1/analysis/backtest` - Run backtest analysis
- `POST /api/v1/analysis/retirement` - Get retirement planning analysis

### Content
- `GET /api/v1/content/videos` - Get curated financial videos
- `GET /api/v1/content/events` - Get live market events

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Using Docker Compose**:
   ```bash
   # Set environment variables
   export GEMINI_API_KEY="your_api_key_here"
   export CORS_ORIGINS="https://yourdomain.com"
   
   # Deploy
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

2. **Manual deployment**:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `CACHE_DEFAULT_TTL` | Default cache TTL | `300` (5 min) |
| `LOG_LEVEL` | Logging level | `info` |

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Speed Limiting**: Progressive delays for high-frequency requests
- **Input Sanitization**: Protection against NoSQL injection and XSS
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS origins
- **Request Validation**: Comprehensive input validation
- **Error Handling**: Secure error responses without sensitive data

## Caching Strategy

- **Dashboard Data**: 5 minutes
- **Stock Data**: 3 minutes
- **Market Indices**: 5 minutes
- **Watchlist Prices**: 2 minutes
- **AI Analysis**: 10 minutes
- **News Articles**: 5 minutes
- **Videos**: 30 minutes

## Monitoring & Logging

- **Health Check**: `GET /health`
- **Structured Logging**: JSON format in production
- **Request Tracking**: Unique request IDs
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Cache hit/miss rates

## Architecture

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── server.ts        # Main server file
```

## Development

### Code Quality
```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm test           # Run tests
```

### Docker Development
```bash
docker-compose up -d    # Start services
docker-compose logs -f  # View logs
docker-compose down     # Stop services
```

## Production Considerations

1. **SSL/TLS**: Use HTTPS in production (nginx configuration included)
2. **Environment Variables**: Use secure secret management
3. **Monitoring**: Set up application monitoring (logs, metrics)
4. **Backup**: Regular backup of logs and configuration
5. **Updates**: Keep dependencies updated for security

## API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123456789"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123456789"
}
```

## License

Private - InsiderPulse AI