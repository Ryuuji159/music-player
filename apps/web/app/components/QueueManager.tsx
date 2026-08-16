import { GripVertical, Play, X } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import type { QueueItemDto } from "@skrd/contracts";
import { queueAPI } from "~/api/queue";
import { playerAPI } from "~/api/player";
import { useQueue } from "~/hooks/useQueue";
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
      className={`grid cursor-grab grid-cols-12 gap-1 active:cursor-grabbing ${isCurrent ? "bg-accent/10" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="col-span-1 flex items-center justify-center">
        <GripVertical className="h-4 w-4 text-ink-muted" />
      </div>
      <div className="col-span-2 p-px">
        <img src={item.media.thumbnailUrl} alt="" className="object-contain" />
      </div>
      <div className="col-span-7 min-w-0 flex flex-col justify-center">
        <p className="truncate font-medium text-ink">
          {item.media.title}
          {item.status === "playing" && <span className="text-accent"> ●</span>}
          {item.status === "paused" && <span className="text-ink-muted"> ❚❚</span>}
        </p>
        <p className="truncate text-sm text-ink-muted">{item.media.channelTitle}</p>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          className="cursor-pointer text-ink-muted hover:text-accent"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPlay(item.id); }}
          aria-label="Reproducir"
        ><Play className="h-4 w-4" /></button>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          className="cursor-pointer text-ink-muted hover:text-red-500"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        ><X className="h-4 w-4" /></button>
      </div>
    </li>
  );
}

export const QueueManager = () => {
  const [queue, setQueue] = useQueue();

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <NowPlaying />
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

        setQueue(next);
        queueAPI.move(draggedId, siblingId, placement).catch(console.error);
      }}>
        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto border-2 border-ink">
          {queue.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} onRemove={(id) => queueAPI.remove(id).catch(console.error)} onPlay={(id) => playerAPI.playItem(id).catch(console.error)} />
          ))}
        </ul>
      </DragDropProvider>

      <button className="cursor-pointer border-2 border-red-600 px-4 py-2 font-bold uppercase tracking-wide text-red-600 hover:bg-red-50" onClick={() => queueAPI.clear().catch(console.error)}>
        Limpiar cola
      </button>
    </section>
  )
}
