import { z } from 'zod';

export const generateTasksSchema = z.object({
  goal: z.string().min(3, 'Goal description must be at least 3 characters').max(500),
  context: z.string().max(1000).optional(),
});

export const generateSubtasksSchema = z.object({
  taskTitle: z.string().min(3, 'Task title must be at least 3 characters').max(200),
  taskDescription: z.string().max(1000).optional(),
});

export const prioritizeTasksSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export const summarizeProjectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export const generateInsightsSchema = z.object({
  projectId: z.string().optional(),
});
