import z from 'zod';

export const venueSettingsSchema = z.object({
  skipOnError: z.boolean(),
});
export type VenueSettingsDto = z.infer<typeof venueSettingsSchema>;

export const updateVenueSettingsSchema = z.object({
  skipOnError: z.boolean(),
});
export type UpdateVenueSettingsDto = z.infer<typeof updateVenueSettingsSchema>;
