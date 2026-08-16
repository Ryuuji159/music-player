import z from 'zod';

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  errors: z.unknown().optional(),
});

export type ApiErrorDto = z.infer<typeof apiErrorSchema>;
