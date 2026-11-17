import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { sendError } from '../utils/responseHelper';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
}

const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Access denied. No token provided.');
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      sendError(res, 500, 'JWT secret is not configured');
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      sendError(res, 401, 'User not found. Token is invalid.');
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      sendError(res, 401, 'Invalid token');
      return;
    }
    if (error.name === 'TokenExpiredError') {
      sendError(res, 401, 'Token expired');
      return;
    }
    sendError(res, 500, 'Authentication error', error);
  }
};

export default auth;
