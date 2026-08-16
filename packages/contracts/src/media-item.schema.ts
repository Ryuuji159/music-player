import z from "zod";

export const mediaItemSchema = z.object({
    id: z.uuid(),
    videoId: z.string(),
    title: z.string(),
    channelTitle: z.string(),
    thumbnailUrl: z.url(),
    duration: z.number().int().nonnegative(),
    embeddable: z.boolean(),
})

export type MediaItemDto = z.infer<typeof mediaItemSchema>;

export const mediaListSchema = z.array(mediaItemSchema);
export type MediaListDto = z.infer<typeof mediaListSchema>;