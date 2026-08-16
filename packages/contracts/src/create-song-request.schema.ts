import z from 'zod';
import { youtubeUrlSchema } from './youtube-url.schema';

export const createSongRequestSchema = z
  .object({
    url: youtubeUrlSchema,
    requestedBy: z.string().trim().max(50).optional(),
  })
  .transform(({ url, requestedBy }) => ({
    videoId: url,
    requestedBy: requestedBy && requestedBy.length > 0 ? requestedBy : null,
  }));

export type CreateSongRequestDto = z.infer<typeof createSongRequestSchema>;
