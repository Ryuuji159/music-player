import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useAppendVideoToQueue } from '~/hooks/useQueue';
import { usePlaylist } from '~/hooks/usePlaylists';
import { useVenueSlug } from '~/hooks/useVenueSlug';

export const PlaylistItems = ({ playlistId }: { playlistId: string }) => {
  const slug = useVenueSlug();
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const detailQuery = usePlaylist(slug, playlistId);
  const appendMutation = useAppendVideoToQueue(slug);

  const detail = detailQuery.data;
  const searchQuery = search.trim().toLowerCase();
  const filteredItems = detail
    ? searchQuery
      ? detail.items.filter(
          (m) =>
            m.title.toLowerCase().includes(searchQuery) ||
            m.channelTitle.toLowerCase().includes(searchQuery),
        )
      : detail.items
    : [];

  const addToQueue = async (videoId: string) => {
    try {
      await appendMutation.mutateAsync(videoId);
      setAddedId(videoId);
      setTimeout(
        () => setAddedId((cur) => (cur === videoId ? null : cur)),
        1500,
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mb-2 flex flex-col gap-2 rounded-xl border border-border bg-muted/50 p-3">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar canción…"
      />

      {detailQuery.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : detail ? (
        filteredItems.length ? (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {filteredItems.map((media) => (
              <li key={media.id} className="flex items-center gap-3 py-2">
                <img
                  src={media.thumbnailUrl}
                  alt=""
                  className="h-12 w-20 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{media.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {media.channelTitle}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => addToQueue(media.videoId)}
                        aria-label="Añadir a la cola"
                      />
                    }
                  >
                    {addedId === media.videoId ? <Check /> : <Plus />}
                  </TooltipTrigger>
                  <TooltipContent>Añadir a la cola</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyTitle>No se encontraron canciones</EmptyTitle>
              <EmptyDescription>
                Prueba con otro término de búsqueda.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <Empty className="p-4">
          <EmptyHeader>
            <EmptyTitle>No se pudieron cargar los videos</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
