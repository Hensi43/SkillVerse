import { User, IUser } from '../entities/user';

export interface IUserRepository {
  findByPhoneNumber(phoneNumber: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  update(id: string, userData: Partial<IUser>): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async findByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    return User.findOne({ phoneNumber });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, userData, { new: true });
  }
}
