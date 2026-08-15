import { MediaItemDto, QueueItemDto } from "@skrd/contracts";
import { MediaItem, QueueItem } from "../prisma/generated/prisma/client";
import { time } from "node:console";

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
        embeddable: media.embeddable
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

