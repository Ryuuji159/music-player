import z from 'zod';

export const venueSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
});
export type VenueDto = z.infer<typeof venueSchema>;

export const venueListSchema = z.array(venueSchema);
export type VenueListDto = z.infer<typeof venueListSchema>;
