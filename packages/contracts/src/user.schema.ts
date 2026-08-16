import z from 'zod';

export const userRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  role: userRoleSchema,
  venueId: z.uuid().nullable(),
  venueSlug: z.string().nullable(),
});
export type UserDto = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
export type UserListDto = z.infer<typeof userListSchema>;
