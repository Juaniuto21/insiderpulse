import { Router } from 'express';
import {
  addToWatchlist,
  addToWatchlistValidation,
  removeFromWatchlist,
  getUserWatchlist,
  getWatchlistWithPrices
} from '@/controllers/watchlistController.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

/**
 * @route POST /api/v1/watchlist
 * @desc Add item to watchlist
 * @body ticker, name
 * @access Private
 */
router.post('/', authenticate, addToWatchlistValidation, addToWatchlist);

/**
 * @route DELETE /api/v1/watchlist/:ticker
 * @desc Remove item from watchlist
 * @param ticker - Stock ticker
 * @access Private
 */
router.delete('/:ticker', authenticate, removeFromWatchlist);

/**
 * @route GET /api/v1/watchlist
 * @desc Get user's watchlist
 * @access Private
 */
router.get('/', authenticate, getUserWatchlist);

/**
 * @route GET /api/v1/watchlist/prices
 * @desc Get user's watchlist with current prices
 * @access Private
 */
router.get('/prices', authenticate, getWatchlistWithPrices);

export default router;