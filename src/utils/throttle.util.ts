import redis from '../config/redis.config';

export interface ThrottleOptions {
  windowMs: number;
  maxRequests: number;
  key?: string;
}

export class ThrottleService {
  static async isThrottled(
    identifier: string,
    options: ThrottleOptions
  ): Promise<{ throttled: boolean; retryAfter?: number }> {
    try {
      const key = `throttle:${options.key || 'default'}:${identifier}`;
      const now = Date.now();
      const windowStart = now - options.windowMs;

      await redis.zremrangebyscore(key, 0, windowStart);

      const count = await redis.zcard(key);

      if (count >= options.maxRequests) {
        const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const retryAfter = oldest.length > 1 
          ? Math.ceil((parseInt(oldest[1]) + options.windowMs - now) / 1000)
          : Math.ceil(options.windowMs / 1000);

        return { throttled: true, retryAfter };
      }

      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.pexpire(key, options.windowMs);

      return { throttled: false };
    } catch (error) {
      console.error('Throttle check error:', error);
      return { throttled: false };
    }
  }

  static throttleDecorator(options: ThrottleOptions) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const req = args[0];
        const res = args[1];
        
        const user = req.user as any;
        const identifier = user?.userId || user?.id || req.ip || 'anonymous';

        const result = await ThrottleService.isThrottled(
          identifier,
          options
        );

        if (result.throttled) {
          return res.status(429).json({
            error: 'Too many requests',
            message: 'You are making requests too quickly',
            retryAfter: result.retryAfter,
          });
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

export const throttle = (options: ThrottleOptions) => 
  ThrottleService.throttleDecorator(options);
