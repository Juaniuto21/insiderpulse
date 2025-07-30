import NodeCache from 'node-cache';
import { logger } from '@/config/logger.js';
import { config } from '@/config/environment.js';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cacheDefaultTtl,
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false,
      deleteOnExpire: true,
      enableLegacyCallbacks: false,
      maxKeys: 1000 // Limit cache size
    });

    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      logger.debug('Cache statistics', stats);
    }, 300000); // Every 5 minutes
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl || config.cacheDefaultTtl);
      if (success) {
        logger.debug(`Cache set: ${key}`, { ttl: ttl || config.cacheDefaultTtl });
      }
      return success;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        logger.debug(`Cache hit: ${key}`);
      } else {
        logger.debug(`Cache miss: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return undefined;
    }
  }

  del(key: string): number {
    try {
      const deleted = this.cache.del(key);
      logger.debug(`Cache delete: ${key}`, { deleted });
      return deleted;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return 0;
    }
  }

  flush(): void {
    try {
      this.cache.flushAll();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error', { error });
    }
  }

  getStats() {
    return this.cache.getStats();
  }

  // Generate cache key with parameters
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  // Cache with automatic key generation
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const fresh = await fetchFunction();
      this.set(key, fresh, ttl);
      return fresh;
    } catch (error) {
      logger.error('Cache getOrSet error', { key, error });
      throw error;
    }
  }
}

export const cacheService = new CacheService();