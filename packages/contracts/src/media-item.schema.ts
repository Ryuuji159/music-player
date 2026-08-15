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