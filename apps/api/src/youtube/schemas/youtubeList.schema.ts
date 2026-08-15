import z from "zod";
import { videoDurationSchema } from "./videoDuration.schema";
import { youtubeIdSchema } from "@skrd/contracts";

export const youtubeListSchema = z
    .object({
        kind: z.literal('youtube#videoListResponse'),
        items: z.array(
            z.object({
                kind: z.literal("youtube#video"),
                id: youtubeIdSchema,
                snippet: z.object({
                    title: z.string(),
                    thumbnails: z.object({
                        default: z.object({
                            url: z.url(),
                        })
                    }),
                    channelTitle: z.string(),
                }),
                contentDetails: z.object({
                    duration: videoDurationSchema
                }),
                status: z.object({
                    embeddable: z.boolean()
                })
            })
        )
    })

export type YoutubeList = z.infer<typeof youtubeListSchema>