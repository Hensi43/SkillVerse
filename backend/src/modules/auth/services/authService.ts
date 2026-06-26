import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../../config/env';
import { UserRepository } from '../repositories/userRepository';
import { IUser } from '../entities/user';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../../core/errors/appError';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user with email and password.
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
    if (!email || !password || !name) {
      throw new BadRequestError('Name, email, and password are all required.');
    }
    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long.');
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestError('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'worker', // default, will be updated during role selection
      preferredLanguage: 'en',
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  /**
   * Log in an existing user with email and password.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required.');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  /**
   * Generates a 6-digit OTP and logs it to console for local testing.
   * Kept for backwards compatibility.
   */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; mockCode?: string }> {
    if (!phoneNumber) {
      throw new BadRequestError('Phone number is required.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await this.userRepository.findByPhoneNumber(phoneNumber);

    if (!user) {
      user = await this.userRepository.create({
        phoneNumber,
        role: 'worker',
        preferredLanguage: 'en',
      });
    }

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log(`\n======================================================`);
    console.log(`[OTP DISPATCH] SMS to: ${phoneNumber}`);
    console.log(`[OTP DISPATCH] Verification Code: ${otpCode}`);
    console.log(`[OTP DISPATCH] Expiration: 5 minutes`);
    console.log(`======================================================\n`);

    if (config.mockOtp) {
      return { success: true, mockCode: otpCode };
    }

    return { success: true };
  }

  /**
   * Directly log in or register user using phone number (OTP disabled).
   * Kept for backwards compatibility.
   */
  async verifyOtp(
    phoneNumber: string,
    _code?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
    if (!phoneNumber) {
      throw new BadRequestError('Phone number is required.');
    }

    let user = await this.userRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
      user = await this.userRepository.create({
        phoneNumber,
        role: 'worker',
        preferredLanguage: 'en',
      });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  /**
   * Refreshes access token via valid refresh token.
   */
  async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    if (!token) {
      throw new BadRequestError('Refresh token is required.');
    }

    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret) as { id: string };
      const user = await this.userRepository.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('User session invalid.');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  /**
   * Updates user role in database.
   */
  async updateUserRole(userId: string, role: 'worker' | 'employer'): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    user.role = role;
    return user.save();
  }

  generateAccessToken(user: IUser): string {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email, phoneNumber: user.phoneNumber },
      config.jwtSecret,
      { expiresIn: '1d' }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { id: user._id },
      config.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }
}
