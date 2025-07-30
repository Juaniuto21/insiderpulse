import { Router } from 'express';
import { 
  getStockData, 
  getStockDataValidation,
  getWatchlistPrices,
  getWatchlistPricesValidation,
  getMarketIndices,
  getMarketIndicesValidation
} from '@/controllers/stockController.js';

const router = Router();

/**
 * @route GET /api/v1/stocks/:ticker
 * @desc Get comprehensive stock data
 * @param ticker - Stock ticker symbol
 * @access Public
 */
router.get('/:ticker', getStockDataValidation, getStockData);

/**
 * @route POST /api/v1/stocks/watchlist/prices
 * @desc Get prices for multiple tickers
 * @body tickers - Array of ticker symbols
 * @access Public
 */
router.post('/watchlist/prices', getWatchlistPricesValidation, getWatchlistPrices);

/**
 * @route GET /api/v1/stocks/indices/:region
 * @desc Get market indices for a region
 * @param region - Market region (US, Europe, Asia, Cryptos)
 * @access Public
 */
router.get('/indices/:region', getMarketIndicesValidation, getMarketIndices);

export default router;