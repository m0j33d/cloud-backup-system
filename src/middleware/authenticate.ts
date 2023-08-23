// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET as string;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the request headers or query string or wherever you send it
  const token = req.headers.authorization?.split(' ')[1] || req.query.token as string | null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    // If token is valid, attach the decoded payload to the request object
    (req as any).user = decoded;

    next();
  });
};

export default authMiddleware;
