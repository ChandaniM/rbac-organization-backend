import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.config';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      keyGenerator: (req: Request) => {
        const user = req.user as any;
        const userId = user?.userId || user?.id;
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        return userId ? `user:${userId}` : `ip:${ip}`;
      },
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Redis may still be connecting during application startup. Do not
        // block requests when the optional rate-limit store is unavailable.
        if (redis.status !== 'ready') {
          return next();
        }

        const key = this.config.keyGenerator!(req);
        const redisKey = `ratelimit:${key}:${req.path}`;

        const current = await redis.incr(redisKey);

        if (current === 1) {
          await redis.pexpire(redisKey, this.config.windowMs);
        }

        const ttl = await redis.pttl(redisKey);

        res.setHeader('X-RateLimit-Limit', this.config.max.toString());
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.max - current).toString());
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());

        if (current > this.config.max) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: this.config.message,
            retryAfter: Math.ceil(ttl / 1000),
          });
        }

        const config = this.config;
        const originalSend = res.send;
        res.send = function (data: any) {
          const statusCode = res.statusCode;
          const shouldSkip =
            (config.skipSuccessfulRequests && statusCode < 400) ||
            (config.skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            redis.decr(redisKey).catch(err => console.error('Error decrementing rate limit:', err));
          }

          res.send = originalSend;
          return originalSend.call(res, data);
        };

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        next();
      }
    };
  }
}

export const createRateLimiter = (config: RateLimitConfig) => {
  return new RateLimiter(config).middleware();
};

export const rateLimitPresets = {
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
  }),

  api: createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please slow down',
  }),

  search: createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many search requests, please try again later',
  }),

  expensive: createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'This operation is rate limited, please try again later',
  }),

  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Upload limit reached, please try again later',
  }),
};
