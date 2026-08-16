import z from 'zod';
import { venueSchema } from './venue.schema';

export const userRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  venues: z.array(venueSchema),
});
export type UserDto = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
export type UserListDto = z.infer<typeof userListSchema>;
