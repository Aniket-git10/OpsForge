import { Router } from 'express';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

router.use(authenticateJWT);

router.get('/task/:taskId', getTaskComments);
router.post('/', validateRequest(createCommentSchema), createComment);
router.patch('/:id', validateRequest(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

export default router;
