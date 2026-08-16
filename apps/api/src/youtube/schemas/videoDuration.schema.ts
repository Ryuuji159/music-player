import z from 'zod';

export const videoDurationSchema = z.string().transform((value, ctx) => {
  try {
    return Temporal.Duration.from(value);
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid ISO 8601 duration',
    });

    return z.NEVER;
  }
});

export type VideoDuration = z.infer<typeof videoDurationSchema>;
