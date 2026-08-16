import { useEffect, useState } from 'react';
import { Check, Library, Plus, Search } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useMediaSearch } from '~/hooks/useMedia';
import { useAppendVideoToQueue } from '~/hooks/useQueue';

export const MediaLibrary = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const appendMutation = useAppendVideoToQueue();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useMediaSearch(debouncedQuery);
  const results = searchQuery.data ?? [];

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="size-4 text-muted-foreground" />
          Biblioteca
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canción registrada…"
            className="pl-9"
          />
        </div>

        {searchQuery.isFetching && results.length === 0 && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!searchQuery.isFetching && debouncedQuery.length === 0 && (
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Busca una canción</EmptyTitle>
              <EmptyDescription>
                Busca entre las canciones ya registradas en el sistema.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!searchQuery.isFetching &&
          debouncedQuery.length > 0 &&
          results.length === 0 && (
            <Empty className="p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>Sin resultados</EmptyTitle>
                <EmptyDescription>Prueba con otro término.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

        {results.length > 0 && (
          <ul className="max-h-64 divide-y divide-border overflow-y-auto">
            {results.map((media) => (
              <li key={media.id} className="flex items-center gap-3 py-2">
                <img
                  src={media.thumbnailUrl}
                  alt=""
                  className="h-9 w-12 shrink-0 object-cover"
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
        )}
      </CardContent>
    </Card>
  );
};
