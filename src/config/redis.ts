import Redis from 'ioredis';
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis();

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error(`Redis Error: ${err}`);
});

export default redisClient;