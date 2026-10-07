import { Router } from 'express';
import {
  getOrganization,
  addMember,
  updateMemberRole,
  removeMember,
} from '../controllers/organization.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validateRequest } from '../middleware/validate.js';
import {
  addOrgMemberSchema,
  updateOrgMemberRoleSchema,
} from '../validators/organization.validator.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getOrganization);
router.post('/members', requireRole(['admin']), validateRequest(addOrgMemberSchema), addMember);
router.patch(
  '/members/:userId',
  requireRole(['admin']),
  validateRequest(updateOrgMemberRoleSchema),
  updateMemberRole
);
router.delete('/members/:userId', requireRole(['admin']), removeMember);

export default router;
