import { z } from 'zod';

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assignee: z.string().optional().nullable(),
  labels: z.array(z.string()).default([]),
  estimatedHours: z.number().min(0).max(500).optional().nullable(),
  dueDate: z.string().datetime().or(z.string().date()).optional().nullable(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        completed: z.boolean().default(false),
      })
    )
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignee: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).max(500).nullable().optional(),
  dueDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  order: z.number().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']),
  newOrder: z.number().min(0).optional(),
});

export const addSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required').max(200),
});

export const updateSubtaskSchema = z.object({
  completed: z.boolean(),
  title: z.string().min(1).max(200).optional(),
});
