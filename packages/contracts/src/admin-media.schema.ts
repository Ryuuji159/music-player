import z from 'zod';
import { mediaItemSchema } from './media-item.schema';

export const adminMediaErrorSchema = z.object({
  venueId: z.uuid(),
  venueName: z.string(),
  venueSlug: z.string(),
  errorCode: z.number().int(),
  createdAt: z.string(),
});

export type AdminMediaErrorDto = z.infer<typeof adminMediaErrorSchema>;

export const adminMediaItemSchema = mediaItemSchema.extend({
  errors: z.array(adminMediaErrorSchema),
  usage: z.object({
    queueItems: z.number().int().nonnegative(),
    songRequests: z.number().int().nonnegative(),
    playlistItems: z.number().int().nonnegative(),
  }),
});

export type AdminMediaItemDto = z.infer<typeof adminMediaItemSchema>;

export const adminMediaListSchema = z.array(adminMediaItemSchema);
export type AdminMediaListDto = z.infer<typeof adminMediaListSchema>;
