import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { VideoInfo } from "./schemas/videoInfo.schema";
import { ConfigService } from "@nestjs/config";
import { YoutubeId } from "@skrd/contracts";
import { youtubeListSchema } from "./schemas/youtubeList.schema";

@Injectable()
export class YoutubeService {
    constructor(private readonly httpService: HttpService, private readonly config: ConfigService) { }

    async getVideoInfo(youtubeId: YoutubeId): Promise<VideoInfo|null> {
        const response = await firstValueFrom(
            this.httpService.get(
                'https://www.googleapis.com/youtube/v3/videos',
                {
                    params: {
                        key: this.config.getOrThrow("YOUTUBE_KEY"),
                        id: youtubeId,
                        part: 'contentDetails,snippet,status'
                    }
                }
            )
        )

        const parsed = youtubeListSchema.safeParse(response.data);

        if(!parsed.success) {
            return null;
        }

        
        const video = parsed.data.items[0];
        if (!video) {
            return null;
        }

        const videoInfo : VideoInfo = {
            id: video.id,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            channelTitle: video.snippet.channelTitle,
            duration: video.contentDetails.duration,
            embeddable: video.status.embeddable,
        };

        return videoInfo;
    }
}