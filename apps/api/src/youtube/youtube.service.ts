import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { AxiosResponse } from 'axios';
import { VideoInfo } from './schemas/videoInfo.schema';
import { ConfigService } from '@nestjs/config';
import { PlaylistId, YoutubeId } from '@skrd/contracts';
import { youtubeListLenientSchema } from './schemas/youtubeList.schema';
import {
  youtubePlaylistItemsLenientSchema,
  youtubePlaylistLenientSchema,
} from './schemas/youtubePlaylist.schema';

type PlaylistInfo = {
  title: string;
  thumbnailUrl: string | null;
  itemCount: number;
};

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  private async get(
    endpoint: string,
    params: Record<string, unknown>,
  ): Promise<AxiosResponse<unknown>> {
    const url = `https://www.googleapis.com/youtube/v3/${endpoint}`;
    try {
      return await firstValueFrom(
        this.httpService.get<unknown>(url, { params }),
      );
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            error?: { code?: number; message?: string; errors?: unknown };
          };
        };
        message?: string;
      };
      const status = err?.response?.status;
      const ytMessage = err?.response?.data?.error?.message;
      const ytErrors = err?.response?.data?.error?.errors;
      this.logger.error(
        `YouTube API ${endpoint} -> ${status ?? '?'}: ${ytMessage ?? err?.message ?? 'unknown error'}`,
      );
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
      const response = await this.get('videos', {
        key: this.config.getOrThrow('YOUTUBE_KEY'),
        id: batch.join(','),
        part: 'contentDetails,snippet,status',
      });

      const parsed = youtubeListLenientSchema.safeParse(response.data);
      if (!parsed.success) continue;

      for (const video of parsed.data.items) {
        if (
          !video.contentDetails ||
          !video.status ||
          !video.snippet.thumbnails
        ) {
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
      this.logger.log(
        `Skipped ${skipped} unavailable videos (sin duration/status/thumbnail)`,
      );
    }

    return result;
  }

  async getPlaylistInfo(playlistId: PlaylistId): Promise<PlaylistInfo | null> {
    const response = await this.get('playlists', {
      key: this.config.getOrThrow('YOUTUBE_KEY'),
      id: playlistId,
      part: 'snippet,contentDetails',
    });

    const parsed = youtubePlaylistLenientSchema.safeParse(response.data);
    if (!parsed.success) return null;

    const item = parsed.data.items[0];
    if (!item) return null;

    return {
      title: item.snippet?.title ?? 'Playlist',
      thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? null,
      itemCount: item.contentDetails?.itemCount ?? 0,
    };
  }

  isMixPlaylist(playlistId: PlaylistId, itemCount?: number): boolean {
    if (playlistId.startsWith('RD')) return true;
    return itemCount === 0;
  }

  async listPlaylistVideoIds(
    playlistId: PlaylistId,
    limit = 1000,
  ): Promise<YoutubeId[]> {
    const ids: YoutubeId[] = [];

    let pageToken: string | undefined;
    do {
      const response = await this.get('playlistItems', {
        key: this.config.getOrThrow('YOUTUBE_KEY'),
        playlistId,
        part: 'snippet',
        maxResults: 50,
        ...(pageToken ? { pageToken } : {}),
      });

      const parsed = youtubePlaylistItemsLenientSchema.safeParse(response.data);
      if (parsed.success) {
        for (const it of parsed.data.items) {
          const videoId = it.snippet?.resourceId?.videoId;
          if (videoId) ids.push(videoId);
          if (ids.length >= limit) break;
        }
        pageToken = parsed.data.nextPageToken;
      } else {
        pageToken = undefined;
      }
    } while (pageToken && ids.length < limit);

    if (ids.length >= limit) {
      this.logger.log(`Playlist ${playlistId} truncated at ${limit} videos`);
    }

    return ids;
  }
}
