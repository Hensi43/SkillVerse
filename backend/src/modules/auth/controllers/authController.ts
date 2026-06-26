import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../../../shared/middlewares/auth';
import { BadRequestError } from '../../../core/errors/appError';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.register(email, password, name);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            preferredLanguage: result.user.preferredLanguage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            preferredLanguage: result.user.preferredLanguage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  requestOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phoneNumber } = req.body;
      const result = await this.authService.requestOtp(phoneNumber);
      res.status(200).json({
        success: true,
        message: 'OTP dispatched successfully.',
        ...(result.mockCode ? { mockCode: result.mockCode } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phoneNumber } = req.body;
      const result = await this.authService.verifyOtp(phoneNumber);
      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: result.user._id,
            phoneNumber: result.user.phoneNumber,
            role: res.locals.roleOverride || result.user.role,
            preferredLanguage: result.user.preferredLanguage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);
      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { role } = req.body;
      if (role !== 'worker' && role !== 'employer') {
        throw new BadRequestError('Invalid role. Must be either worker or employer.');
      }

      const user = await this.authService.updateUserRole(userId, role);
      const accessToken = this.authService.generateAccessToken(user);

      res.status(200).json({
        success: true,
        message: 'Role updated successfully.',
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            preferredLanguage: user.preferredLanguage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
