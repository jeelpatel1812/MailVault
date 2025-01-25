import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://127.0.0.1:6379',
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
