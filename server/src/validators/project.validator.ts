import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Project key must be alphanumeric')
    .toUpperCase(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  startDate: z.string().datetime().or(z.string().date()).optional(),
  deadline: z.string().datetime().or(z.string().date()).optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(['manager', 'contributor', 'viewer']),
      })
    )
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  startDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  deadline: z.string().datetime().or(z.string().date()).nullable().optional(),
  isArchived: z.boolean().optional(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['manager', 'contributor', 'viewer']).default('contributor'),
});
