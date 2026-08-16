import z from 'zod';

export const playlistIdSchema = z.string().brand<'PlaylistId'>();
export type PlaylistId = z.infer<typeof playlistIdSchema>;

export const playlistUrlSchema = z
  .url()
  .transform((url, ctx) => {
    const match = /[?&]list=([^&#]+)/.exec(url);
    if (!match) {
      ctx.addIssue({ code: 'custom', message: "URL sin parámetro 'list'" });
      return z.NEVER;
    }
    return match[1];
  })
  .pipe(playlistIdSchema);
