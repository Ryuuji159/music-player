import { ListMusic } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { useQueue } from '~/hooks/useQueue';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { cn } from '~/lib/utils';

export const Queue = () => {
  const slug = useVenueSlug();
  const { data: queue = [] } = useQueue(slug);

  if (queue.length === 0) {
    return (
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListMusic />
          </EmptyMedia>
          <EmptyTitle>La cola está vacía</EmptyTitle>
          <EmptyDescription>
            Pega una URL para añadir canciones.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul className="divide-y divide-border">
        {queue.map((item) => {
          const isCurrent =
            item.status === 'playing' || item.status === 'paused';
          return (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2',
                isCurrent && 'bg-primary/10',
              )}
            >
              <img
                src={item.media.thumbnailUrl}
                alt=""
                className="h-14 w-24 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-medium">
                    {item.media.title}
                  </p>
                  {item.status === 'playing' && (
                    <Badge className="shrink-0">Sonando</Badge>
                  )}
                  {item.status === 'paused' && (
                    <Badge variant="secondary" className="shrink-0">
                      Pausa
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {item.media.channelTitle}
                </p>
                {item.requestedBy && (
                  <p className="truncate text-xs text-muted-foreground">
                    Pedida por {item.requestedBy}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
