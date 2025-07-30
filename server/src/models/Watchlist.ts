import { databaseService } from '@/config/database.js';
import { logger } from '@/config/logger.js';

export interface WatchlistItem {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  created_at: Date;
}

export class WatchlistModel {
  static async add(userId: string, ticker: string, name: string): Promise<WatchlistItem> {
    const query = `
      INSERT INTO watchlist (user_id, ticker, name, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, ticker) DO UPDATE SET name = $3
      RETURNING *
    `;
    
    const result = await databaseService.query(query, [userId, ticker, name]);
    logger.info('Watchlist item added', { userId, ticker });
    return result.rows[0];
  }

  static async remove(userId: string, ticker: string): Promise<boolean> {
    const query = 'DELETE FROM watchlist WHERE user_id = $1 AND ticker = $2';
    const result = await databaseService.query(query, [userId, ticker]);
    return result.rowCount > 0;
  }

  static async findByUserId(userId: string): Promise<WatchlistItem[]> {
    const query = `
      SELECT * FROM watchlist 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await databaseService.query(query, [userId]);
    return result.rows;
  }

  static async exists(userId: string, ticker: string): Promise<boolean> {
    const query = 'SELECT 1 FROM watchlist WHERE user_id = $1 AND ticker = $2';
    const result = await databaseService.query(query, [userId, ticker]);
    return result.rowCount > 0;
  }

  static async count(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM watchlist WHERE user_id = $1';
    const result = await databaseService.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}