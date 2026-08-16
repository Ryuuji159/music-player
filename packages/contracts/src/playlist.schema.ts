import z from 'zod';
import { mediaItemSchema } from './media-item.schema';

export const playlistSchema = z.object({
  id: z.uuid(),
  playlistId: z.string(),
  title: z.string(),
  thumbnailUrl: z.url().nullable(),
  itemCount: z.number().int().nonnegative(),
});

export const playlistListSchema = z.array(playlistSchema);
export type PlaylistDto = z.infer<typeof playlistSchema>;

export const playlistDetailSchema = playlistSchema.extend({
  items: z.array(mediaItemSchema),
});
export type PlaylistDetailDto = z.infer<typeof playlistDetailSchema>;
