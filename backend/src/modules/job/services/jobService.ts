import { JobRepository } from '../repositories/jobRepository';
import { WorkerService } from '../../worker/services/workerService';
import { storageService } from '../../../shared/services/storageService';
import { IJob } from '../entities/job';
import { IApplication } from '../entities/application';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../../core/errors/appError';

export class JobService {
  private jobRepository: JobRepository;
  private workerService: WorkerService;

  constructor() {
    this.jobRepository = new JobRepository();
    this.workerService = new WorkerService();
  }

  async createJob(employerId: string, jobData: Partial<IJob>): Promise<IJob> {
    if (!jobData.title || !jobData.description || !jobData.tradeCategory || !jobData.address) {
      throw new BadRequestError('Required job details (title, description, category, address) are missing.');
    }

    if (!jobData.location || !jobData.location.coordinates) {
      throw new BadRequestError('Geospatial location coordinates must be set.');
    }

    return this.jobRepository.create({
      ...jobData,
      employerId: employerId as any,
      status: 'open'
    });
  }

  async getNearbyJobs(
    lng: number,
    lat: number,
    radiusKm = 10,
    category?: string
  ): Promise<IJob[]> {
    if (lng === undefined || lat === undefined) {
      throw new BadRequestError('Client coordinate coordinates (lng, lat) are required.');
    }

    const radiusInMeters = radiusKm * 1000;
    return this.jobRepository.findNearby(lng, lat, radiusInMeters, category);
  }

  async getJobsByEmployer(employerId: string): Promise<IJob[]> {
    return this.jobRepository.findByEmployerId(employerId);
  }

  /**
   * Applies a worker profile to a job post. Uploads voice pitch intro using active Storage service.
   */
  async applyForJob(
    workerUserId: string,
    jobId: string,
    voicePitchFile?: { buffer: Buffer; mimetype: string }
  ): Promise<IApplication> {
    const worker = await this.workerService.getProfileByUserId(workerUserId);
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError('Target job posting does not exist.');
    }

    if (job.status !== 'open') {
      throw new BadRequestError('This job posting is no longer open for applications.');
    }

    let voicePitchUrl: string | undefined;

    if (voicePitchFile) {
      const fileName = `pitches/pitch-${worker._id}-${Date.now()}.webm`;
      voicePitchUrl = await storageService.uploadFile(
        voicePitchFile.buffer,
        fileName,
        voicePitchFile.mimetype
      );
    }

    try {
      return await this.jobRepository.createApplication({
        jobId: job._id as any,
        workerId: worker._id as any,
        status: 'applied',
        voicePitchUrl
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestError('You have already applied for this job posting.');
      }
      throw err;
    }
  }

  /**
   * Gets applications submitted to an employer's job, checking verification.
   */
  async getJobApplications(jobId: string, employerUserId: string): Promise<IApplication[]> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job posting not found.');
    }

    // Ensure the requesting user is the owner of this job posting
    if (job.employerId.toString() !== employerUserId) {
      throw new ForbiddenError('You are not authorized to view applicants for this job.');
    }

    return this.jobRepository.findApplicationsByJobId(jobId);
  }

  /**
   * Gets applications completed by the worker.
   */
  async getWorkerApplications(workerUserId: string): Promise<IApplication[]> {
    const worker = await this.workerService.getProfileByUserId(workerUserId);
    return this.jobRepository.findApplicationsByWorkerId(worker._id.toString());
  }

  /**
   * Updates pipeline state (applied -> shortlisted -> hired).
   */
  async updateApplicationStatus(
    employerUserId: string,
    applicationId: string,
    status: 'applied' | 'shortlisted' | 'hired' | 'rejected'
  ): Promise<IApplication> {
    const app = await ApplicationWithJobPopulated(applicationId);
    if (!app) {
      throw new NotFoundError('Application record not found.');
    }

    const job = app.jobId as any; // Cast for mongoose references
    if (job.employerId.toString() !== employerUserId) {
      throw new ForbiddenError('You do not own the job posting associated with this application.');
    }

    const updated = await this.jobRepository.updateApplicationStatus(applicationId, status);
    if (!updated) {
      throw new BadRequestError('Failed to update application status.');
    }
    return updated;
  }
}

// Helper database populate query since Mongoose typing varies
async function ApplicationWithJobPopulated(id: string) {
  const { Application } = require('../entities/application');
  return Application.findById(id).populate('jobId');
}
