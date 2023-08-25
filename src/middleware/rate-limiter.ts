import redisClient from "../config/redis"
import { Request, Response, NextFunction } from 'express';


const RATELIMITER_DURATION =  60 //in seconds
const NO_OF_REQUEST_ALLOWED = 60


export const rateLimiter = async ( req: Request, res: Response, next: NextFunction ) => {
    const clientIP = req.ip;

    try {
        const currentRequests = await redisClient.incr(clientIP);

        if (currentRequests === 1) {
          await redisClient.expire(clientIP, RATELIMITER_DURATION);
        }
    
        if (currentRequests > NO_OF_REQUEST_ALLOWED) {
          return res.status(429).json({ message: `Rate limit exceeded, Try again after ${RATELIMITER_DURATION} seconds` });
        }
    
        next();
      } catch (error) {
        next(error);
      }
    
    await redisClient
    
}