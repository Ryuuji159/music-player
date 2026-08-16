import z from "zod";
import { playlistUrlSchema } from "./playlist-url.schema";

export const registerPlaylistSchema = z
    .object({ url: playlistUrlSchema })
    .transform(({ url }) => ({ playlistId: url }));

export type RegisterPlaylistDto = z.infer<typeof registerPlaylistSchema>;
