import Redis from "ioredis";
// Redis client if u are running redis on local it connects aouthomatically but u can add config if u wnat 

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on('connect', () => console.log(' Redis connected successfully.'));
redis.on('error', (err) => console.error('Redis connection failed:', err));

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});
export default redis;
