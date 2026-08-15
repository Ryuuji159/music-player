import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { YoutubeService } from "../youtube/youtube.service";
import { YoutubeId } from "@skrd/contracts";

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
}