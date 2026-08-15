import z from "zod";
import { videoDurationSchema } from "./videoDuration.schema";
import { youtubeIdSchema } from "@skrd/contracts";

export const videoInfoSchema = z
    .object({
        id: youtubeIdSchema,
        title: z.string(),
        thumbnail: z.url(),
        channelTitle: z.string(),
        duration: videoDurationSchema,
        embeddable: z.boolean()
    });

export type VideoInfo = z.infer<typeof videoInfoSchema>