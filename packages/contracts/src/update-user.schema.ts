import z from 'zod';
import { userRoleSchema } from './user.schema';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  password: z.string().min(1).max(200).optional(),
  role: userRoleSchema.default('user'),
  venueIds: z.array(z.uuid()).default([]),
});
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
