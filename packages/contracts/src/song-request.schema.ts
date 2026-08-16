import z from 'zod';
import { mediaItemSchema } from './media-item.schema';

export const songRequestStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
]);
export type SongRequestStatus = z.infer<typeof songRequestStatusSchema>;

export const songRequestSchema = z.object({
  id: z.uuid(),
  status: songRequestStatusSchema,
  requestedBy: z.string().nullable(),
  createdAt: z.string(),
  media: mediaItemSchema,
});
export type SongRequestDto = z.infer<typeof songRequestSchema>;

export const songRequestListSchema = z.array(songRequestSchema);
export type SongRequestListDto = z.infer<typeof songRequestListSchema>;
