import z from 'zod';

export const createVenueSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug')
    .optional(),
});
export type CreateVenueDto = z.infer<typeof createVenueSchema>;
