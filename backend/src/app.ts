import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { errorHandler } from './shared/middlewares/errorHandler';
import { apiLimiter } from './shared/middlewares/rateLimit';
import { NotFoundError } from './core/errors/appError';

// Import Routers
import authRoutes from './modules/auth/routes/authRoutes';
import workerRoutes from './modules/worker/routes/workerRoutes';
import jobRoutes from './modules/job/routes/jobRoutes';
import assessmentRoutes from './modules/assessment/routes/assessmentRoutes';

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload directories (e.g. /uploads/file.webm)
app.use('/uploads', express.static(config.uploadDir));

// Apply global rate limiting for security
app.use('/api', apiLimiter);

// Bind API Modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/assessments', assessmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillVerse Server operational.' });
});

// Catch all unmatched routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found.`));
});

// Centralized error interceptor
app.use(errorHandler as any);

export { app };
export default app;
