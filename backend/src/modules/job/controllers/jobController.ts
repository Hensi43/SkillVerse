import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middlewares/auth';
import { JobService } from '../services/jobService';
import { BadRequestError } from '../../../core/errors/appError';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  postJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employerId = req.user!.id;
      const job = await this.jobService.createJob(employerId, req.body);
      res.status(201).json({
        success: true,
        message: 'Job posting created successfully.',
        data: job
      });
    } catch (error) {
      next(error);
    }
  };

  searchNearbyJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lng, lat, radiusKm, category } = req.query;

      if (!lng || !lat) {
        throw new BadRequestError('Client coordinates (lng, lat) are required.');
      }

      const longitude = parseFloat(lng as string);
      const latitude = parseFloat(lat as string);
      const radius = radiusKm ? parseFloat(radiusKm as string) : 10;

      const jobs = await this.jobService.getNearbyJobs(
        longitude,
        latitude,
        radius,
        category as string
      );

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployerJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employerId = req.user!.id;
      const jobs = await this.jobService.getJobsByEmployer(employerId);
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  };

  apply = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workerUserId = req.user!.id;
      const { id: jobId } = req.params;
      const voiceFile = req.file;

      const application = await this.jobService.applyForJob(
        workerUserId,
        jobId,
        voiceFile ? { buffer: voiceFile.buffer, mimetype: voiceFile.mimetype } : undefined
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: application
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employerUserId = req.user!.id;
      const { id: jobId } = req.params;

      const applicants = await this.jobService.getJobApplications(jobId, employerUserId);
      res.status(200).json({
        success: true,
        count: applicants.length,
        data: applicants
      });
    } catch (error) {
      next(error);
    }
  };

  getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workerUserId = req.user!.id;
      const applications = await this.jobService.getWorkerApplications(workerUserId);
      
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employerUserId = req.user!.id;
      const { id: applicationId } = req.params;
      const { status } = req.body;

      if (!status || !['applied', 'shortlisted', 'hired', 'rejected'].includes(status)) {
        throw new BadRequestError('Invalid pipeline state status code.');
      }

      const updated = await this.jobService.updateApplicationStatus(
        employerUserId,
        applicationId,
        status
      );

      res.status(200).json({
        success: true,
        message: 'Applicant status updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };
}
