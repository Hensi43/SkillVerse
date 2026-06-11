import { WorkerRepository } from '../repositories/workerRepository';
import { UserRepository } from '../../auth/repositories/userRepository';
import { IWorker } from '../entities/worker';
import { NotFoundError, BadRequestError } from '../../../core/errors/appError';

export class WorkerService {
  private workerRepository: WorkerRepository;
  private userRepository: UserRepository;

  constructor() {
    this.workerRepository = new WorkerRepository();
    this.userRepository = new UserRepository();
  }

  async getProfileByUserId(userId: string): Promise<IWorker> {
    const worker = await this.workerRepository.findByUserId(userId);
    if (!worker) {
      throw new NotFoundError('Worker profile not found. Please set up your profile details.');
    }
    return worker;
  }

  async getProfileById(id: string): Promise<IWorker> {
    const worker = await this.workerRepository.findById(id);
    if (!worker) {
      throw new NotFoundError('Worker profile not found.');
    }
    return worker;
  }

  /**
   * Creates or updates a worker profile, syncing role configuration in User records.
   */
  async upsertProfile(userId: string, data: Partial<IWorker>): Promise<IWorker> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Associated user profile not found.');
    }

    // Force synchronize the User collection role to 'worker' if they save a worker profile
    if (user.role !== 'worker') {
      user.role = 'worker';
      await user.save();
    }

    let worker = await this.workerRepository.findByUserId(userId);

    const updatePayload = {
      fullName: data.fullName,
      gender: data.gender,
      tradeCategory: data.tradeCategory,
      currentSalaryEst: data.currentSalaryEst,
      languages: data.languages || ['en'],
      skills: data.skills || [],
      experienceYears: data.experienceYears || 0,
      workHistory: data.workHistory || [],
      address: data.address,
      ...(data.location ? { location: data.location } : {})
    };

    if (worker) {
      const updated = await this.workerRepository.updateByUserId(userId, updatePayload);
      if (!updated) {
        throw new BadRequestError('Failed to update worker profile.');
      }
      return updated;
    } else {
      // Create new profile record
      const created = await this.workerRepository.create({
        userId: user._id as any,
        ...updatePayload
      });
      return created;
    }
  }

  /**
   * Invokes geo-queries for finding nearby workers (meters conversion).
   */
  async getNearbyWorkers(
    lng: number,
    lat: number,
    radiusKm = 10,
    category?: string
  ): Promise<IWorker[]> {
    if (lng === undefined || lat === undefined) {
      throw new BadRequestError('Latitude and longitude coordinates are required for location queries.');
    }

    const radiusInMeters = radiusKm * 1000;
    return this.workerRepository.findNearby(lng, lat, radiusInMeters, category);
  }

  /**
   * Compiles the verified badge aggregates and passport metadata.
   */
  async getPublicPassport(workerId: string) {
    const worker = await this.workerRepository.findById(workerId);
    if (!worker) {
      throw new NotFoundError('Skill Passport not found.');
    }

    // Return visual summary objects suited for UI cards or shareable public links
    return {
      fullName: worker.fullName,
      tradeCategory: worker.tradeCategory,
      rating: worker.rating,
      reviewCount: worker.reviewCount,
      experienceYears: worker.experienceYears,
      skills: worker.skills,
      languages: worker.languages,
      verifiedBadges: worker.verifiedBadges,
      workHistory: worker.workHistory,
      address: worker.address,
      joinedAt: worker.createdAt
    };
  }
}
