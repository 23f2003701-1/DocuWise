import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHelper';

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    sendError(res, 400, messages.join(', '));
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    sendError(res, 400, `${field} already exists`);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 400, 'Invalid ID format');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 401, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 401, 'Token expired');
    return;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    sendError(res, 400, 'File size cannot exceed 10MB');
    return;
  }

  // Default server error
  sendError(res, err.statusCode || 500, err.message || 'Internal Server Error', err);
};

export default errorHandler;
