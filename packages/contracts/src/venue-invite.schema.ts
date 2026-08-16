import z from 'zod';

export const venueInviteSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
});
export type VenueInviteDto = z.infer<typeof venueInviteSchema>;

export const joinResponseSchema = z.object({
  venueSlug: z.string(),
});
export type JoinResponseDto = z.infer<typeof joinResponseSchema>;
