import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authLimiter } from '../../../shared/middlewares/rateLimit';
import { authenticate } from '../../../shared/middlewares/auth';

const router = Router();
const controller = new AuthController();

router.post('/request-otp', authLimiter, controller.requestOtp);
router.post('/verify-otp', authLimiter, controller.verifyOtp);
router.post('/refresh', controller.refresh);
router.put('/role', authenticate as any, controller.updateRole as any);

export default router;
