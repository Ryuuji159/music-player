import z from 'zod';

export const createVenueSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
  name: z.string().min(1).max(100),
});
export type CreateVenueDto = z.infer<typeof createVenueSchema>;
