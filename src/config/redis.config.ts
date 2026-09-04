import Redis from 'ioredis';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  // Queue normal application commands until Redis finishes connecting.
  enableOfflineQueue: true,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null;
    }

    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export const bullRedisConfig = {
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('ready', () => {
  console.log('✅ Redis is ready to accept commands');
});

export default redis;
