import { Router } from 'express';
import {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/task.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  addSubtaskSchema,
  updateSubtaskSchema,
} from '../validators/task.validator.js';

const router = Router();

router.use(authenticateJWT);

// Project tasks endpoint
router.get('/project/:projectId', getProjectTasks);

// Task CRUD
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/:id', getTaskById);
router.patch('/:id', validateRequest(updateTaskSchema), updateTask);
router.patch('/:id/status', validateRequest(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', deleteTask);

// Subtasks
router.post('/:id/subtasks', validateRequest(addSubtaskSchema), addSubtask);
router.patch('/:id/subtasks/:subtaskId', validateRequest(updateSubtaskSchema), updateSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

export default router;
