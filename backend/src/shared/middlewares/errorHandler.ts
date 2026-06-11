import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../core/errors/appError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log critical/system issues
  if (!(err instanceof AppError) || !err.isOperational) {
    console.error('Unhandled System Error:', err);
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'An unexpected error occurred';
  
  const response: { success: boolean; message: string; errors?: any[]; stack?: string } = {
    success: false,
    message,
  };

  // Append validation array if appropriate
  if (err instanceof ValidationError && err.errors.length > 0) {
    response.errors = err.errors;
  }

  // Display stack traces ONLY in non-production environments
  if (process.env.NODE_ENV !== 'production' && !(err instanceof AppError)) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
