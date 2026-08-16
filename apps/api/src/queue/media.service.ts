import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { YoutubeService } from "../youtube/youtube.service";
import { MediaItemDto, YoutubeId } from "@skrd/contracts";
import type { MediaItem } from "../prisma/generated/prisma/client";
import { toMediaDto } from "./queue.mapper";

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService, private youtube: YoutubeService) { }

    async resolve(videoId: YoutubeId) {
        const media = await this.prisma.mediaItem.findFirst({
            where: { videoId }
        });

        if (media) return media;

        const video = await this.youtube.getVideoInfo(videoId);
        if (!video) return null;

        return this.prisma.mediaItem.create({
            data: {
                videoId: video.id,
                title: video.title,
                channelTitle: video.channelTitle,
                thumbnailUrl: video.thumbnail,
                duration: video.duration.toString(),
                embeddable: video.embeddable,
            }
        })
    }

    async resolveMany(videoIds: YoutubeId[]): Promise<MediaItem[]> {
        const uniqueIds = [...new Set(videoIds)];

        const existing = await this.prisma.mediaItem.findMany({
            where: { videoId: { in: uniqueIds } }
        });

        const byVideoId = new Map(existing.map((m) => [m.videoId, m]));

        const missingIds = uniqueIds.filter((id) => !byVideoId.has(id));
        const videos = missingIds.length ? await this.youtube.getVideosInfo(missingIds) : [];

        if (videos.length) {
            await this.prisma.mediaItem.createMany({
                data: videos.map((v) => ({
                    videoId: v.id,
                    title: v.title,
                    channelTitle: v.channelTitle,
                    thumbnailUrl: v.thumbnail,
                    duration: v.duration.toString(),
                    embeddable: v.embeddable,
                }))
            });

            const created = await this.prisma.mediaItem.findMany({
                where: { videoId: { in: videos.map((v) => v.id) } }
            });
            for (const m of created) byVideoId.set(m.videoId, m);
        }

        return videoIds
            .map((id) => byVideoId.get(id))
            .filter((m): m is MediaItem => m !== undefined);
    }

    async search(q?: string): Promise<MediaItemDto[]> {
        const query = q?.trim();

        const items = await this.prisma.mediaItem.findMany({
            where: query
                ? {
                      OR: [
                          { title: { contains: query, mode: "insensitive" } },
                          { channelTitle: { contains: query, mode: "insensitive" } },
                      ],
                  }
                : undefined,
            orderBy: { title: "asc" },
            take: 100,
        });

        return items.map(toMediaDto);
    }
}