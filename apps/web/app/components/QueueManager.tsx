import { useEffect, useRef } from "react";
import { GripVertical, ListMusic, Pause, Play, SkipBack, SkipForward, Trash2, X } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useQueryClient } from "@tanstack/react-query";
import type { QueueItemDto } from "@skrd/contracts";
import { Button } from "~/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { queueKeys, useClearQueue, useMoveQueueItem, useQueue, useRemoveQueueItem } from "~/hooks/useQueue";
import { usePlayerActions } from "~/hooks/usePlayer";
import { cn } from "~/lib/utils";
import { NowPlaying } from "./NowPlaying";

function SortableRow({ item, index, onRemove, onPlay }: {
  item: QueueItemDto;
  index: number;
  onRemove: (id: string) => void;
  onPlay: (id: string) => void;
}) {
  const { ref, isDragging } = useSortable({ id: item.id, index });
  const isCurrent = item.status === "playing" || item.status === "paused";

  return (
    <li
      ref={ref}
      data-current={isCurrent ? "true" : undefined}
      className={cn(
        "grid cursor-grab grid-cols-12 items-center gap-2 px-2 py-2 active:cursor-grabbing",
        isCurrent && "bg-primary/10",
        isDragging && "opacity-50"
      )}
    >
      <div className="col-span-1 flex items-center justify-center">
        <GripVertical className="size-4 text-muted-foreground" />
      </div>
      <div className="col-span-3">
        <img src={item.media.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
      </div>
      <div className="col-span-6 min-w-0">
        <p className="truncate font-medium">{item.media.title}</p>
        <p className="truncate text-sm text-muted-foreground">{item.media.channelTitle}</p>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onPlay(item.id); }}
                aria-label="Reproducir"
              />
            }
          >
            <Play />
          </TooltipTrigger>
          <TooltipContent>Reproducir</TooltipContent>
        </Tooltip>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                aria-label="Eliminar"
              />
            }
          >
            <X />
          </TooltipTrigger>
          <TooltipContent>Eliminar de la cola</TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
}

export const QueueManager = () => {
  const { data: queue = [] } = useQueue();
  const queryClient = useQueryClient();
  const moveMutation = useMoveQueueItem();
  const removeMutation = useRemoveQueueItem();
  const clearMutation = useClearQueue();
  const { play, pause, next, previous, playItem } = usePlayerActions();

  const listRef = useRef<HTMLUListElement>(null);
  const currentId = queue.find((i) => i.status === "playing" || i.status === "paused")?.id;

  useEffect(() => {
    if (!currentId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>("[data-current]");
    if (!el) return;

    const list = listRef.current;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offset = elRect.top - listRect.top + list.scrollTop - list.clientHeight / 2 + elRect.height / 2;
    list.scrollTo({ top: offset, behavior: "smooth" });
  }, [currentId]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <NowPlaying />
      <div className="flex gap-2 justify-center">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" onClick={() => previous.mutate()} aria-label="Anterior" />}
          >
            <SkipBack />
          </TooltipTrigger>
          <TooltipContent>Anterior</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button size="icon" onClick={() => play.mutate()} aria-label="Reproducir" />}
          >
            <Play />
          </TooltipTrigger>
          <TooltipContent>Reproducir</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" onClick={() => pause.mutate()} aria-label="Pausar" />}
          >
            <Pause />
          </TooltipTrigger>
          <TooltipContent>Pausar</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" onClick={() => next.mutate()} aria-label="Siguiente" />}
          >
            <SkipForward />
          </TooltipTrigger>
          <TooltipContent>Siguiente</TooltipContent>
        </Tooltip>
      </div>
      {queue.length === 0 ? (
        <Empty className="p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ListMusic /></EmptyMedia>
            <EmptyTitle>La cola está vacía</EmptyTitle>
            <EmptyDescription>Añade canciones o deja que suene una playlist de backup.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DragDropProvider onDragEnd={(event) => {
            if (event.canceled) return;

            const { source } = event.operation;
            if (!isSortable(source)) return;

            const { initialIndex, index } = source;
            if (initialIndex === index) return;

            const draggedId = source.id as string;

            const next = [...queue];
            const [moved] = next.splice(initialIndex, 1);
            next.splice(index, 0, moved);

            const prev = next[index - 1];
            const after = next[index + 1];
            const { siblingId, placement } = prev
              ? { siblingId: prev.id, placement: "after" as const }
              : { siblingId: after!.id, placement: "before" as const };

            queryClient.setQueryData(queueKeys.all, next);
            moveMutation.mutate(
              { id: draggedId, siblingId, placement },
              { onError: () => queryClient.invalidateQueries({ queryKey: queueKeys.all }) }
            );
          }}>
            <ul ref={listRef} className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
              {queue.map((item, index) => (
                <SortableRow key={item.id} item={item} index={index} onRemove={(id) => removeMutation.mutate(id)} onPlay={(id) => playItem.mutate(id)} />
              ))}
            </ul>
          </DragDropProvider>

          <Button variant="destructive" onClick={() => clearMutation.mutate()}>
            <Trash2 data-icon="inline-start" />
            Limpiar cola
          </Button>
        </>
      )}
    </section>
  )
}
