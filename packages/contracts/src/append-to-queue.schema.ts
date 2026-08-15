import z from "zod";
import { youtubeUrlSchema } from "./youtube-url.schema";

export const appendToQueueSchema = z
    .object({url: youtubeUrlSchema})
    .transform(({url}) => ({videoId: url}));

export type AppendToQueueDto = z.infer<typeof appendToQueueSchema>;