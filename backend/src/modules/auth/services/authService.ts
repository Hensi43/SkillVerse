import jwt from 'jsonwebtoken';
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
   * Generates a 6-digit OTP and logs it to console for local testing.
   */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; mockCode?: string }> {
    if (!phoneNumber) {
      throw new BadRequestError('Phone number is required.');
    }

    // Standardize 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    let user = await this.userRepository.findByPhoneNumber(phoneNumber);

    if (!user) {
      // Auto-register new users as workers by default
      user = await this.userRepository.create({
        phoneNumber,
        role: 'worker',
        preferredLanguage: 'en',
      });
    }

    // Save temporary OTP state
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

    // Here you would integrate Twilio or MSG91 in production.
    return { success: true };
  }

  /**
   * Directly log in or register user using phone number (OTP disabled).
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
      // Auto-register new users as workers by default
      user = await this.userRepository.create({
        phoneNumber,
        role: 'worker',
        preferredLanguage: 'en',
      });
    }

    // Clear any pending OTP code just in case
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
      { id: user._id, role: user.role, phoneNumber: user.phoneNumber },
      config.jwtSecret,
      { expiresIn: '1d' } // Extended token life for smooth MVP demoing
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
