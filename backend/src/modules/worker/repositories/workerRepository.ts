import { Worker, IWorker } from '../entities/worker';

export interface IWorkerRepository {
  findByUserId(userId: string): Promise<IWorker | null>;
  findById(id: string): Promise<IWorker | null>;
  create(workerData: Partial<IWorker>): Promise<IWorker>;
  updateByUserId(userId: string, workerData: Partial<IWorker>): Promise<IWorker | null>;
  findNearby(longitude: number, latitude: number, maxDistanceMeters: number, category?: string): Promise<IWorker[]>;
}

export class WorkerRepository implements IWorkerRepository {
  async findByUserId(userId: string): Promise<IWorker | null> {
    return Worker.findOne({ userId }).populate('userId', 'phoneNumber role preferredLanguage');
  }

  async findById(id: string): Promise<IWorker | null> {
    return Worker.findById(id).populate('userId', 'phoneNumber role preferredLanguage');
  }

  async create(workerData: Partial<IWorker>): Promise<IWorker> {
    const worker = new Worker(workerData);
    return worker.save();
  }

  async updateByUserId(userId: string, workerData: Partial<IWorker>): Promise<IWorker | null> {
    return Worker.findOneAndUpdate({ userId }, workerData, { new: true, runValidators: true });
  }

  async findNearby(
    longitude: number,
    latitude: number,
    maxDistanceMeters: number,
    category?: string
  ): Promise<IWorker[]> {
    const query: any = {
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

    return Worker.find(query).populate('userId', 'phoneNumber role');
  }
}
