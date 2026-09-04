import { Request, Response, NextFunction } from 'express';
import CacheService from '../utils/cache.util';

export interface CacheMiddlewareOptions {
  ttl?: number;
  prefix?: string;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

export const cacheMiddleware = (options: CacheMiddlewareOptions = {}) => {
  const {
    ttl = 300,
    prefix = 'api',
    keyGenerator = (req: Request) => {
      const user = req.user as any;
      const tenantId = user?.tenantId || 'no-tenant';
      const query = JSON.stringify(req.query);
      return `${req.path}:${tenantId}:${query}`;
    },
    condition = () => true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      const cached = await CacheService.get(cacheKey, { prefix });

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = function (data: any) {
        CacheService.set(cacheKey, data, { prefix, ttl }).catch(err =>
          console.error('Cache set error:', err)
        );
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCachePattern = async (pattern: string, prefix: string = 'api') => {
  const fullPattern = `${prefix}:${pattern}`;
  return CacheService.invalidatePattern(fullPattern);
};
