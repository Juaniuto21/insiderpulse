import { databaseService } from '@/config/database.js';
import { hashPassword, verifyPassword } from '@/middleware/auth.js';
import { logger } from '@/config/logger.js';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'premium' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  login_attempts: number;
  locked_until?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'premium' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'premium' | 'admin';
  is_active?: boolean;
  email_verified?: boolean;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { email, password, name, role = 'user' } = userData;
    const passwordHash = await hashPassword(password);
    
    const query = `
      INSERT INTO users (email, password_hash, name, role, is_active, email_verified, created_at, updated_at, login_attempts)
      VALUES ($1, $2, $3, $4, true, false, NOW(), NOW(), 0)
      RETURNING *
    `;
    
    try {
      const result = await databaseService.query(query, [email, passwordHash, name, role]);
      logger.info('User created', { userId: result.rows[0].id, email });
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await databaseService.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await databaseService.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, updateData: UpdateUserData): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await databaseService.query(query, values);
    return result.rows[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      throw new Error('Account is temporarily locked');
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.id);
      return null;
    }

    // Reset login attempts and update last login
    await this.resetLoginAttempts(user.id);
    return user;
  }

  static async incrementLoginAttempts(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET login_attempts = login_attempts + 1,
          locked_until = CASE 
            WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until
          END
      WHERE id = $1
    `;
    await databaseService.query(query, [userId]);
  }

  static async resetLoginAttempts(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET login_attempts = 0, 
          locked_until = NULL, 
          last_login = NOW()
      WHERE id = $1
    `;
    await databaseService.query(query, [userId]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await databaseService.query(query, [id]);
    return result.rowCount > 0;
  }

  static async list(limit: number = 50, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await databaseService.query(query, [limit, offset]);
    return result.rows;
  }
}