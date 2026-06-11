import { Router } from 'express';
import multer from 'multer';
import { JobController } from '../controllers/jobController';
import { authenticate, authorize } from '../../../shared/middlewares/auth';

const router = Router();
const controller = new JobController();

// Configure in-memory parser for worker voice pitch uploads (max 5MB WebM files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Employer endpoints
router.post(
  '/', 
  authenticate as any, 
  authorize(['employer', 'admin']) as any, 
  controller.postJob as any
);

router.get(
  '/employer', 
  authenticate as any, 
  authorize(['employer', 'admin']) as any, 
  controller.getEmployerJobs as any
);

router.get(
  '/:id/applicants', 
  authenticate as any, 
  authorize(['employer', 'admin']) as any, 
  controller.getApplicants as any
);

router.patch(
  '/applications/:id/status', 
  authenticate as any, 
  authorize(['employer', 'admin']) as any, 
  controller.updateStatus as any
);

// Worker endpoints
router.post(
  '/:id/apply', 
  authenticate as any, 
  authorize(['worker', 'admin']) as any, 
  upload.single('voicePitch'), 
  controller.apply as any
);

router.get(
  '/worker/applications', 
  authenticate as any, 
  authorize(['worker', 'admin']) as any, 
  controller.getMyApplications as any
);

// Shared search endpoints
router.get('/nearby', authenticate as any, controller.searchNearbyJobs as any);

export default router;
