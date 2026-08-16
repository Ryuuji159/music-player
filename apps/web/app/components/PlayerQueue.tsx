import { useEffect, useRef, useState } from 'react';
import { ListMusic, Maximize, Minimize } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useQueue } from '~/hooks/useQueue';
import { cn } from '~/lib/utils';

export const PlayerQueue = () => {
  const { data: queue = [] } = useQueue();
  const listRef = useRef<HTMLUListElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = queue.findIndex(
    (i) => i.status === 'playing' || i.status === 'paused',
  );
  const currentId = currentIndex >= 0 ? queue[currentIndex].id : undefined;

  useEffect(() => {
    if (!currentId || !listRef.current) return;
    const el = listRef.current.querySelector('[data-current]');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [currentId]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      document.documentElement.requestFullscreen().catch(console.error);
    }
  };

  if (queue.length === 0) {
    return (
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListMusic />
          </EmptyMedia>
          <EmptyTitle>La cola está vacía</EmptyTitle>
          <EmptyDescription>No hay canciones en la cola.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          En cola · {currentIndex >= 0 ? currentIndex + 1 : 0} / {queue.length}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen
                    ? 'Salir de pantalla completa'
                    : 'Pantalla completa'
                }
              />
            }
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          </TooltipContent>
        </Tooltip>
      </div>
      <ul
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {queue.map((item) => {
          const isCurrent =
            item.status === 'playing' || item.status === 'paused';
          return (
            <li
              key={item.id}
              data-current={isCurrent ? 'true' : undefined}
              className={cn(
                'flex gap-3 p-3',
                isCurrent
                  ? 'border-l-4 border-primary bg-primary/15'
                  : 'border-l-4 border-transparent border-b last:border-b-0',
              )}
            >
              <img
                src={item.media.thumbnailUrl}
                alt=""
                className="h-14 w-24 shrink-0 object-cover"
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'line-clamp-2 leading-tight',
                    isCurrent && 'font-semibold',
                  )}
                >
                  {item.media.title}
                  {isCurrent && <Badge className="ml-2">Sonando</Badge>}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.media.channelTitle}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
