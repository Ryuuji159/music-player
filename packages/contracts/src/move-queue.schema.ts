import z from 'zod';

const placementOptions = ['before', 'after'] as const;

export const moveQueueSchema = z.object({
  siblingId: z.uuid(),
  placement: z.enum(placementOptions),
});

export type MoveQueueDto = z.infer<typeof moveQueueSchema>;
