import { Router } from 'express';
import multer from 'multer';
import { AssessmentController } from '../controllers/assessmentController';
import { authenticate } from '../../../shared/middlewares/auth';

const router = Router();
const controller = new AssessmentController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per audio response
});

router.get('/questions', authenticate as any, controller.getQuestions as any);
router.post('/submit', authenticate as any, upload.array('audioAnswers'), controller.submit as any);
router.get('/:id', authenticate as any, controller.getStatus as any);

export default router;
