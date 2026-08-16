import { MediaItemDto, QueueItemDto } from "@skrd/contracts";
import { MediaItem, QueueItem } from "../prisma/generated/prisma/client";

function durationToSeconds(iso: string): number {
    return Math.round(Temporal.Duration.from(iso).total("seconds"));
}

export function toMediaDto(media: MediaItem): MediaItemDto {
    return {
        id: media.id,
        videoId: media.videoId,
        title: media.title,
        channelTitle: media.channelTitle,
        thumbnailUrl: media.thumbnailUrl,
        duration: durationToSeconds(media.duration),
        embeddable: media.embeddable,
        playbackErrorCode: media.playbackErrorCode,
    };
}

export function toQueueItemDto(item: QueueItem & {media: MediaItem}): QueueItemDto {
    return {
        id: item.id,
        position: item.position,
        status: item.status as QueueItemDto["status"],
        media: toMediaDto(item.media),
    };
}

