import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): Response => {
  const response: ApiResponse = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  };
  return res.status(statusCode).json(response);
};
