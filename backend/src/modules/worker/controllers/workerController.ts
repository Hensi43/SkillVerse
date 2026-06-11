import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middlewares/auth';
import { WorkerService } from '../services/workerService';
import { BadRequestError } from '../../../core/errors/appError';

export class WorkerController {
  private workerService: WorkerService;

  constructor() {
    this.workerService = new WorkerService();
  }

  getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.workerService.getProfileByUserId(userId);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.workerService.upsertProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Worker profile updated successfully.',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  getPassport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const passport = await this.workerService.getPublicPassport(id);
      res.status(200).json({
        success: true,
        data: passport
      });
    } catch (error) {
      next(error);
    }
  };

  searchNearby = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lng, lat, radiusKm, category } = req.query;
      
      if (!lng || !lat) {
        throw new BadRequestError('Coordinates (lng, lat) must be provided.');
      }

      const longitude = parseFloat(lng as string);
      const latitude = parseFloat(lat as string);
      const radius = radiusKm ? parseFloat(radiusKm as string) : 10;
      
      const workers = await this.workerService.getNearbyWorkers(
        longitude,
        latitude,
        radius,
        category as string
      );

      res.status(200).json({
        success: true,
        count: workers.length,
        data: workers
      });
    } catch (error) {
      next(error);
    }
  };
}
