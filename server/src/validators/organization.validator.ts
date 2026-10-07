import { z } from 'zod';

export const addOrgMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  role: z.enum(['admin', 'project_manager', 'developer', 'member']).default('developer'),
  password: z.string().min(6).optional(),
});

export const updateOrgMemberRoleSchema = z.object({
  role: z.enum(['admin', 'project_manager', 'developer', 'member']),
});
