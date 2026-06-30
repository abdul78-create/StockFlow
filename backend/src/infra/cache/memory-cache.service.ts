import { CacheService } from './cache.service';
import logger from '../logger';

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

export class MemoryCacheService implements CacheService {
  private store = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
    logger.trace({ key, ttlSeconds }, 'Key stored in memory cache');
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    logger.trace({ key }, 'Key deleted from memory cache');
  }

  async ping(): Promise<boolean> {
    // Memory cache is always available
    return true;
  }
}

// Export a singleton instance of the fallback cache service
export const cacheService = new MemoryCacheService();
