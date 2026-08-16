import z from 'zod';
import { youtubeUrlSchema } from './youtube-url.schema';

export const createSongRequestSchema = z
  .object({ url: youtubeUrlSchema })
  .transform(({ url }) => ({ videoId: url }));

export type CreateSongRequestDto = z.infer<typeof createSongRequestSchema>;
