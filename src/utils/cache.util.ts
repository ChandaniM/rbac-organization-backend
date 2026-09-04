import redis from '../config/redis.config';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export class CacheService {
  private static defaultTTL = 300;

  static async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
      const cached = await redis.get(fullKey);
      
      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
      const ttl = options?.ttl ?? this.defaultTTL;
      
      await redis.setex(fullKey, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  static async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
      await redis.del(fullKey);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  static async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  static async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, options);
    
    return fresh;
  }
}

export default CacheService;
