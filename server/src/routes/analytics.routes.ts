import { Router } from 'express';
import {
  getDashboardAnalytics,
  getProjectAnalytics,
} from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/dashboard', getDashboardAnalytics);
router.get('/project/:projectId', getProjectAnalytics);

export default router;
