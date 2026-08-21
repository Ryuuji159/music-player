import { AdminMediaItemDto } from '@skrd/contracts';
import {
  MediaItem,
  Venue,
  VenueMediaError,
} from '../prisma/generated/prisma/client';
import { toMediaDto } from '../queue/queue.mapper';

export type AdminMediaItem = MediaItem & {
  mediaErrors: (VenueMediaError & { venue: Venue })[];
  _count: { queues: number; requests: number; playlistItems: number };
};

export function toAdminMediaDto(item: AdminMediaItem): AdminMediaItemDto {
  return {
    ...toMediaDto(item),
    errors: item.mediaErrors.map((e) => ({
      venueId: e.venueId,
      venueName: e.venue.name,
      venueSlug: e.venue.slug,
      errorCode: e.errorCode,
      createdAt: e.createdAt.toISOString(),
    })),
    usage: {
      queueItems: item._count.queues,
      songRequests: item._count.requests,
      playlistItems: item._count.playlistItems,
    },
  };
}
