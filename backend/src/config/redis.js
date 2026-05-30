import Redis from 'ioredis';

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not set — Redis caching disabled');
    return null;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error(`Redis error: ${err.message}`);
    });

    redisClient.on('close', () => {
      console.warn('Redis connection closed');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
    redisClient = null;
    return null;
  }
};

export const getRedisClient = () => redisClient;

export default connectRedis;