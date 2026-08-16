import z from 'zod';
import { youtubeIdSchema } from '@skrd/contracts';

export const youtubePlaylistLenientSchema = z.object({
  items: z
    .array(
      z.object({
        snippet: z
          .object({
            title: z.string(),
            thumbnails: z
              .object({
                default: z
                  .object({
                    url: z.url(),
                  })
                  .optional(),
              })
              .optional(),
          })
          .optional(),
        contentDetails: z
          .object({
            itemCount: z.number().int().nonnegative(),
          })
          .optional(),
      }),
    )
    .default([]),
});

export const youtubePlaylistItemsLenientSchema = z.object({
  items: z
    .array(
      z.object({
        snippet: z
          .object({
            resourceId: z
              .object({
                videoId: youtubeIdSchema,
              })
              .optional(),
          })
          .optional(),
      }),
    )
    .default([]),
  nextPageToken: z.string().optional(),
});
