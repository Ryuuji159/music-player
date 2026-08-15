import z from "zod";
import { youtubeIdSchema } from "./youtube-id.schema";

/**
 * https://stackoverflow.com/a/77427042
 * 
 * Normal Url: https://www.youtube.com/watch?v=12345678901
 * Share Url: https://youtu.be/12345678901
 * Share Url with start time: https://youtu.be/12345678901?t=6
 * Mobile browser url: https://m.youtube.com/watch?v=12345678901&list=RD12345678901&start_radio=1
 * Long url: https://www.youtube.com/watch?v=12345678901&list=RD12345678901&start_radio=1&rv=smKgVuS
 * Long url with start time: https://www.youtube.com/watch?v=12345678901&list=RD12345678901&start_radio=1&rv=12345678901&t=38
 * Youtube Shorts: https://youtube.com/shorts/12345678901
 */
const YOUTUBE_REGEX = new RegExp(/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);

export const youtubeUrlSchema = z
    .url()
    .regex(YOUTUBE_REGEX, 'Invalid URL')
    .transform((url) => {
        const match = YOUTUBE_REGEX.exec(url);

        return match![1];
    })
    .pipe(youtubeIdSchema);
    
