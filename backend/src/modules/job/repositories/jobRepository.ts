import { Job, IJob } from '../entities/job';
import { Application, IApplication } from '../entities/application';

function getDistanceMeters(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
    const locationNear: any = {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    };

    if (maxDistanceMeters >= 0) {
      locationNear.$maxDistance = maxDistanceMeters;
    }

    const query: any = {
      status: 'open',
      location: {
        $near: locationNear
      }
    };

    if (category) {
      query.tradeCategory = category;
    }

    const jobs = await Job.find(query).populate('employerId', 'phoneNumber').lean();

    const jobsWithDistance = jobs.map((job: any) => {
      if (job.location && job.location.coordinates) {
        const [jobLng, jobLat] = job.location.coordinates;
        job.distance = getDistanceMeters(longitude, latitude, jobLng, jobLat);
      }
      return job;
    });

    return jobsWithDistance as any as IJob[];
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
