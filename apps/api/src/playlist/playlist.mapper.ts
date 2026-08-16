import { PlaylistDetailDto, PlaylistDto } from '@skrd/contracts';
import { MediaItem } from '../prisma/generated/prisma/client';
import { toMediaDto } from '../queue/queue.mapper';

export function toPlaylistDto(p: {
  id: string;
  playlistId: string;
  title: string;
  thumbnailUrl: string | null;
  items?: { media: { thumbnailUrl: string } }[];
  _count?: { items: number };
}): PlaylistDto {
  return {
    id: p.id,
    playlistId: p.playlistId,
    title: p.title,
    thumbnailUrl: p.thumbnailUrl ?? p.items?.[0]?.media.thumbnailUrl ?? null,
    itemCount: p._count?.items ?? p.items?.length ?? 0,
  };
}

export function toPlaylistDetailDto(p: {
  id: string;
  playlistId: string;
  title: string;
  thumbnailUrl: string | null;
  items: { media: MediaItem }[];
}): PlaylistDetailDto {
  return {
    id: p.id,
    playlistId: p.playlistId,
    title: p.title,
    thumbnailUrl: p.thumbnailUrl ?? p.items[0]?.media.thumbnailUrl ?? null,
    itemCount: p.items.length,
    items: p.items.map((i) => toMediaDto(i.media)),
  };
}
