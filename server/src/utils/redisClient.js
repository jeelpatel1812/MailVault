import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URI
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

// Connect Redis client
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected successfully');
  } catch (err) {
    console.error('Error connecting Redis:', err);
    process.exit(1);
  }
})();
