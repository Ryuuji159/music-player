import z from 'zod';
import { userRoleSchema } from './user.schema';

export const createUserSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
  role: userRoleSchema.default('user'),
  venueId: z.uuid().nullable().optional(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;
