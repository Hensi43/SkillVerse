import { Router } from 'express';
import { WorkerController } from '../controllers/workerController';
import { authenticate } from '../../../shared/middlewares/auth';

const router = Router();
const controller = new WorkerController();

router.get('/me', authenticate as any, controller.getMyProfile as any);
router.put('/me', authenticate as any, controller.updateMyProfile as any);
router.get('/passport/:id', authenticate as any, controller.getPassport as any);
router.get('/nearby', authenticate as any, controller.searchNearby as any);

export default router;
