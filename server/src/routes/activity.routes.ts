import { Router } from 'express';
import {
  getProjectActivity,
  getOrganizationActivity,
} from '../controllers/activity.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/project/:projectId', getProjectActivity);
router.get('/organization', getOrganizationActivity);

export default router;
