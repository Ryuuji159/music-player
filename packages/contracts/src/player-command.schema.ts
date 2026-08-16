import z from 'zod';

export const playerCommandSchema = z.object({
  action: z.enum(['play', 'pause', 'stop']),
  videoId: z.string().nullable(),
});

export type PlayerCommandDto = z.infer<typeof playerCommandSchema>;
