import { databaseService } from '@/config/database.js';
import { logger } from '@/config/logger.js';

export interface Alert {
  id: string;
  user_id: string;
  ticker: string;
  alert_type: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  is_read: boolean;
  created_at: Date;
  expires_at?: Date;
}

export interface CreateAlertData {
  user_id: string;
  ticker: string;
  alert_type: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  expires_at?: Date;
}

export class AlertModel {
  static async create(alertData: CreateAlertData): Promise<Alert> {
    const query = `
      INSERT INTO alerts (user_id, ticker, alert_type, risk_level, title, description, is_read, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), $7)
      RETURNING *
    `;
    
    const values = [
      alertData.user_id,
      alertData.ticker,
      alertData.alert_type,
      alertData.risk_level,
      alertData.title,
      alertData.description,
      alertData.expires_at
    ];

    const result = await databaseService.query(query, values);
    logger.info('Alert created', { alertId: result.rows[0].id, ticker: alertData.ticker });
    return result.rows[0];
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<Alert[]> {
    const query = `
      SELECT * FROM alerts 
      WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await databaseService.query(query, [userId, limit]);
    return result.rows;
  }

  static async markAsRead(id: string, userId: string): Promise<boolean> {
    const query = 'UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2';
    const result = await databaseService.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM alerts WHERE id = $1 AND user_id = $2';
    const result = await databaseService.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM alerts 
      WHERE user_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const result = await databaseService.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async cleanup(): Promise<void> {
    const query = 'DELETE FROM alerts WHERE expires_at IS NOT NULL AND expires_at < NOW()';
    const result = await databaseService.query(query);
    logger.info('Expired alerts cleaned up', { count: result.rowCount });
  }
}