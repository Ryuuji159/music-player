import { useEffect, useState } from 'react';
import type { Route } from './+types/admin.media';
import { Search, Trash2 } from 'lucide-react';
import type { AdminMediaItemDto } from '@skrd/contracts';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { Skeleton } from '~/components/ui/skeleton';
import { useAdminMedia, useRemoveMedia } from '~/hooks/useAdminMedia';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Medias' }];
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function usageLabel(media: AdminMediaItemDto): string | null {
  const parts: string[] = [];
  if (media.usage.queueItems > 0) parts.push(`cola ${media.usage.queueItems}`);
  if (media.usage.playlistItems > 0)
    parts.push(`playlists ${media.usage.playlistItems}`);
  if (media.usage.songRequests > 0)
    parts.push(`solicitudes ${media.usage.songRequests}`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function MediaRow({
  media,
  onRemove,
}: {
  media: AdminMediaItemDto;
  onRemove: (id: string) => void;
}) {
  const usage = usageLabel(media);

  return (
    <li className="flex items-center gap-3 py-2">
      <img
        src={media.thumbnailUrl}
        alt=""
        className="h-9 w-12 shrink-0 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{media.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {media.channelTitle} · {formatDuration(media.duration)} ·{' '}
          {media.videoId}
        </p>
        {media.errors.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {media.errors.map((error) => (
              <Badge key={error.venueId} variant="destructive">
                Error {error.errorCode} · {error.venueName}
              </Badge>
            ))}
          </div>
        )}
        {usage && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{usage}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(media.id)}
        aria-label="Eliminar media"
      >
        <Trash2 className="text-destructive" />
      </Button>
    </li>
  );
}

export default function AdminMedia() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const removeMedia = useRemoveMedia();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const listQuery = useAdminMedia(debouncedQuery);
  const medias = listQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medias</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, canal o videoId…"
            className="pl-9"
          />
        </div>

        {listQuery.isFetching && medias.length === 0 && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!listQuery.isFetching && medias.length === 0 && (
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyDescription>
                No hay medias registradas que coincidan.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {medias.length > 0 && (
          <ul className="max-h-[calc(100vh-16rem)] divide-y divide-border overflow-y-auto">
            {medias.map((media) => (
              <MediaRow
                key={media.id}
                media={media}
                onRemove={(id) => removeMedia.mutate(id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
