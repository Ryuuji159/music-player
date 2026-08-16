import z from 'zod';
import { mediaItemSchema } from './media-item.schema';

export const queueItemSchema = z.object({
  id: z.uuid(),
  position: z.number(),
  status: z.enum(['queued', 'playing', 'paused']),
  requestedBy: z.string().nullable(),
  media: mediaItemSchema,
});

export type QueueItemDto = z.infer<typeof queueItemSchema>;
export const queueSchema = z.array(queueItemSchema);
export type QueueDto = z.infer<typeof queueSchema>;
