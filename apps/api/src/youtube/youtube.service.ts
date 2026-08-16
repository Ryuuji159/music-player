import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { VideoInfo } from "./schemas/videoInfo.schema";
import { ConfigService } from "@nestjs/config";
import { PlaylistId, YoutubeId } from "@skrd/contracts";
import { youtubeListLenientSchema } from "./schemas/youtubeList.schema";

@Injectable()
export class YoutubeService {
    private readonly logger = new Logger(YoutubeService.name);

    constructor(private readonly httpService: HttpService, private readonly config: ConfigService) { }

    private async get(endpoint: string, params: Record<string, unknown>) {
        const url = `https://www.googleapis.com/youtube/v3/${endpoint}`;
        try {
            return await firstValueFrom(this.httpService.get(url, { params }));
        } catch (error) {
            const err = error as { response?: { status?: number; data?: { error?: { code?: number; message?: string; errors?: unknown } } }; message?: string };
            const status = err?.response?.status;
            const ytMessage = err?.response?.data?.error?.message;
            const ytErrors = err?.response?.data?.error?.errors;
            this.logger.error(`YouTube API ${endpoint} -> ${status ?? "?"}: ${ytMessage ?? err?.message ?? "unknown error"}`);
            if (ytErrors) this.logger.error(JSON.stringify(ytErrors, null, 2));
            throw error;
        }
    }

    async getVideoInfo(youtubeId: YoutubeId): Promise<VideoInfo | null> {
        const videos = await this.getVideosInfo([youtubeId]);
        return videos[0] ?? null;
    }

    async getVideosInfo(youtubeIds: YoutubeId[]): Promise<VideoInfo[]> {
        const result: VideoInfo[] = [];
        let skipped = 0;

        for (let i = 0; i < youtubeIds.length; i += 50) {
            const batch = youtubeIds.slice(i, i + 50);
            const response = await this.get("videos", {
                key: this.config.getOrThrow("YOUTUBE_KEY"),
                id: batch.join(","),
                part: 'contentDetails,snippet,status'
            });

            const parsed = youtubeListLenientSchema.safeParse(response.data);
            if (!parsed.success) continue;

            for (const video of parsed.data.items) {
                if (!video.contentDetails || !video.status || !video.snippet.thumbnails) {
                    skipped++;
                    continue;
                }
                result.push({
                    id: video.id,
                    title: video.snippet.title,
                    thumbnail: video.snippet.thumbnails.default.url,
                    channelTitle: video.snippet.channelTitle,
                    duration: video.contentDetails.duration,
                    embeddable: video.status.embeddable,
                });
            }
        }

        if (skipped) {
            this.logger.log(`Skipped ${skipped} unavailable videos (sin duration/status/thumbnail)`);
        }

        return result;
    }

    async getPlaylistInfo(playlistId: PlaylistId) {
        const response = await this.get("playlists", {
            key: this.config.getOrThrow("YOUTUBE_KEY"),
            id: playlistId,
            part: "snippet"
        });

        const item = response.data?.items?.[0];
        if (!item) return null;
        return {
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails?.default?.url ?? null,
        }
    }

    async listPlaylistVideoIds(playlistId: PlaylistId): Promise<YoutubeId[]> {
        const ids: YoutubeId[] = [];

        let pageToken: string | undefined;
        do {
            const response = await this.get("playlistItems", {
                key: this.config.getOrThrow("YOUTUBE_KEY"),
                playlistId,
                part: "snippet",
                maxResults: 50,
                ...(pageToken ? { pageToken } : {}),
            });

            for (const it of response.data?.items ?? []) {
                const videoId = it.snippet?.resourceId?.videoId;
                if (videoId) ids.push(videoId);
            }
            pageToken = response.data?.nextPageToken;
        } while (pageToken);

        return ids;
    }
}