import redis from '../config/redis.config';

export class DebounceService {
  private static pendingTimers: Map<string, NodeJS.Timeout> = new Map();

  static async debounce<T>(
    key: string,
    fn: () => Promise<T>,
    delayMs: number
  ): Promise<T | null> {
    const redisKey = `debounce:${key}`;

    const existing = await redis.get(redisKey);
    if (existing) {
      return JSON.parse(existing) as T;
    }

    if (this.pendingTimers.has(key)) {
      clearTimeout(this.pendingTimers.get(key)!);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await fn();
          
          await redis.setex(redisKey, Math.ceil(delayMs / 1000), JSON.stringify(result));
          
          this.pendingTimers.delete(key);
          resolve(result);
        } catch (error) {
          this.pendingTimers.delete(key);
          reject(error);
        }
      }, delayMs);

      this.pendingTimers.set(key, timer);
    });
  }

  static async debouncedSearch<T>(
    searchTerm: string,
    searchFn: (term: string) => Promise<T>,
    delayMs: number = 300
  ): Promise<T | null> {
    const key = `search:${searchTerm}`;
    return this.debounce(key, () => searchFn(searchTerm), delayMs);
  }
}

export const debounceMiddleware = (delayMs: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const searchTerm = req.query.search || req.query.q;
    
    if (!searchTerm) {
      return next();
    }

    const key = `${req.path}:${searchTerm}`;
    const cached = await redis.get(`debounce:${key}`);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    req.debounceKey = key;
    next();
  };
};

export default DebounceService;
