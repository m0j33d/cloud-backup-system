import Redis from 'ioredis';
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
    host: process.env.REDIS_HOST,  
    port: 6379, 
  } as object);

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error(`Redis Error: ${err}`);
});

export default redisClient;