import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middlewares/auth';
import { AIAssessmentService, ISubmittedAnswer } from '../services/aiAssessmentService';
import { BadRequestError } from '../../../core/errors/appError';

export class AssessmentController {
  private assessmentService: AIAssessmentService;

  constructor() {
    this.assessmentService = new AIAssessmentService();
  }

  getQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tradeCategory, language } = req.query;
      if (!tradeCategory || !language) {
        throw new BadRequestError('Parameters tradeCategory and language must be provided.');
      }

      const questions = await this.assessmentService.getQuestions(
        tradeCategory as string,
        language as string
      );

      res.status(200).json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { tradeCategory, language, questionIds, questionTexts } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!tradeCategory || !language || !files || files.length === 0) {
        throw new BadRequestError('Missing tradeCategory, language, or audio files.');
      }

      // Reconstruct answers matching files to question keys
      const qIds = Array.isArray(questionIds) ? questionIds : [questionIds];
      const qTexts = Array.isArray(questionTexts) ? questionTexts : [questionTexts];

      if (files.length !== qIds.length) {
        throw new BadRequestError('Number of audio answers does not match the question set count.');
      }

      const submittedAnswers: ISubmittedAnswer[] = files.map((file, idx) => ({
        questionId: qIds[idx],
        questionText: qTexts[idx],
        buffer: file.buffer,
        mimetype: file.mimetype
      }));

      const assessment = await this.assessmentService.submitAssessment(
        userId,
        tradeCategory,
        language,
        submittedAnswers
      );

      res.status(202).json({
        success: true,
        message: 'Voice assessment submitted and queued for grading.',
        data: {
          assessmentId: assessment._id,
          status: assessment.status
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const assessment = await this.assessmentService.getAssessmentById(id);

      res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      next(error);
    }
  };
}
