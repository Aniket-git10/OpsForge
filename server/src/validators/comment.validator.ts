import { z } from 'zod';

export const createCommentSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  content: z.string().min(1, 'Comment cannot be empty').max(3000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(3000),
});
