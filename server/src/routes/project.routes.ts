import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/project.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
} from '../validators/project.validator.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.post(
  '/',
  requireRole(['admin', 'project_manager']),
  validateRequest(createProjectSchema),
  createProject
);
router.get('/:id', getProjectById);
router.patch(
  '/:id',
  requireRole(['admin', 'project_manager']),
  validateRequest(updateProjectSchema),
  updateProject
);
router.delete('/:id', requireRole(['admin', 'project_manager']), deleteProject);
router.post(
  '/:id/members',
  requireRole(['admin', 'project_manager']),
  validateRequest(addProjectMemberSchema),
  addProjectMember
);
router.delete('/:id/members/:userId', requireRole(['admin', 'project_manager']), removeProjectMember);

export default router;
