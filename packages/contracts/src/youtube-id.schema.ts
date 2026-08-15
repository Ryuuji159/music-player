import z from "zod";

export const youtubeIdSchema = z.string().brand<'VideoID'>();

export type YoutubeId = z.infer<typeof youtubeIdSchema>;
