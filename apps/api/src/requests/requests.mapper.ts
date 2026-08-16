import { SongRequestDto } from '@skrd/contracts';
import { MediaItem, SongRequest } from '../prisma/generated/prisma/client';
import { toMediaDto } from '../queue/queue.mapper';

export function toSongRequestDto(
  request: SongRequest & { media: MediaItem },
): SongRequestDto {
  return {
    id: request.id,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    media: toMediaDto(request.media),
  };
}
