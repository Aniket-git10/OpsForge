import { Router } from 'express';
import {
  generateTasks,
  generateSubtasks,
  prioritizeTasks,
  summarizeProject,
  generateProductivityInsights,
} from '../controllers/ai.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  generateTasksSchema,
  generateSubtasksSchema,
  prioritizeTasksSchema,
  summarizeProjectSchema,
  generateInsightsSchema,
} from '../validators/ai.validator.js';

const router = Router();

router.use(authenticateJWT);

router.post('/generate-tasks', validateRequest(generateTasksSchema), generateTasks);
router.post('/generate-subtasks', validateRequest(generateSubtasksSchema), generateSubtasks);
router.post('/prioritize-tasks', validateRequest(prioritizeTasksSchema), prioritizeTasks);
router.post('/summarize-project', validateRequest(summarizeProjectSchema), summarizeProject);
router.post(
  '/insights',
  validateRequest(generateInsightsSchema),
  generateProductivityInsights
);

export default router;
