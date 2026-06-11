import { Job, IJob } from '../entities/job';
import { Application, IApplication } from '../entities/application';

export interface IJobRepository {
  findById(id: string): Promise<IJob | null>;
  create(jobData: Partial<IJob>): Promise<IJob>;
  update(id: string, jobData: Partial<IJob>): Promise<IJob | null>;
  findNearby(longitude: number, latitude: number, maxDistanceMeters: number, category?: string): Promise<IJob[]>;
  findByEmployerId(employerId: string): Promise<IJob[]>;
  
  createApplication(appData: Partial<IApplication>): Promise<IApplication>;
  findApplicationsByJobId(jobId: string): Promise<IApplication[]>;
  findApplicationsByWorkerId(workerId: string): Promise<IApplication[]>;
  updateApplicationStatus(appId: string, status: 'applied' | 'shortlisted' | 'hired' | 'rejected'): Promise<IApplication | null>;
}

export class JobRepository implements IJobRepository {
  async findById(id: string): Promise<IJob | null> {
    return Job.findById(id).populate('employerId', 'phoneNumber');
  }

  async create(jobData: Partial<IJob>): Promise<IJob> {
    const job = new Job(jobData);
    return job.save();
  }

  async update(id: string, jobData: Partial<IJob>): Promise<IJob | null> {
    return Job.findByIdAndUpdate(id, jobData, { new: true, runValidators: true });
  }

  async findNearby(
    longitude: number,
    latitude: number,
    maxDistanceMeters: number,
    category?: string
  ): Promise<IJob[]> {
    const query: any = {
      status: 'open',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    };

    if (category) {
      query.tradeCategory = category;
    }

    return Job.find(query).populate('employerId', 'phoneNumber');
  }

  async findByEmployerId(employerId: string): Promise<IJob[]> {
    return Job.find({ employerId }).sort({ createdAt: -1 });
  }

  async createApplication(appData: Partial<IApplication>): Promise<IApplication> {
    const app = new Application(appData);
    return app.save();
  }

  async findApplicationsByJobId(jobId: string): Promise<IApplication[]> {
    return Application.find({ jobId })
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'phoneNumber' }
      })
      .sort({ createdAt: -1 });
  }

  async findApplicationsByWorkerId(workerId: string): Promise<IApplication[]> {
    return Application.find({ workerId })
      .populate('jobId')
      .sort({ createdAt: -1 });
  }

  async updateApplicationStatus(
    appId: string,
    status: 'applied' | 'shortlisted' | 'hired' | 'rejected'
  ): Promise<IApplication | null> {
    return Application.findByIdAndUpdate(appId, { status }, { new: true });
  }
}
