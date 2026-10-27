import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const getRedisClient = () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });

    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Redis] Connection warning:', err.message);
      }
    });

    return client;
  } catch (e) {
    console.warn('[Redis] Init error:', e);
    return null;
  }
};

export const redis = globalForRedis.redis ?? getRedisClient();

if (process.env.NODE_ENV !== 'production' && redis) {
  globalForRedis.redis = redis;
}
