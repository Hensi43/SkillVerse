import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/appError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'worker' | 'employer' | 'admin';
    phoneNumber: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or invalid.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      role: 'worker' | 'employer' | 'admin';
      phoneNumber: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Token verification failed. Please login again.'));
  }
};

export const authorize = (roles: Array<'worker' | 'employer' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }

    next();
  };
};
