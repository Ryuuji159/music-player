import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import type { QueueItemDto } from "@skrd/contracts";
import { queueAPI } from "~/api/queue";
import { useQueue } from "~/hooks/useQueue";
import { NowPlaying } from "./NowPlaying";

function SortableRow({ item, index, onRemove }: {
  item: QueueItemDto;
  index: number;
  onRemove: (id: string) => void;
}) {
  const { ref, isDragging } = useSortable({ id: item.id, index });
  const isCurrent = item.status === "playing" || item.status === "paused";

  return (
    <li
      ref={ref}
      className={`grid grid-cols-12 gap-1 ${isCurrent ? "bg-white/10" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="col-span-1 flex items-center justify-center">
        <span className="text-gray-500">{index + 1}</span>
      </div>
      <div className="col-span-2 p-px">
        <img src={item.media.thumbnailUrl} alt="" className="rounded object-contain" />
      </div>
      <div className="col-span-8 min-w-0 flex flex-col justify-center">
        <p className="truncate font-medium text-white">
          {item.media.title}
          {item.status === "playing" && <span className="text-green-400"> ●</span>}
          {item.status === "paused" && <span className="text-yellow-400"> ❚❚</span>}
        </p>
        <p className="truncate text-sm text-gray-500">{item.media.channelTitle}</p>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          className="text-gray-500 hover:text-red-400"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(item.id)}
        >✕</button>
      </div>
    </li>
  );
}

export const QueueManager = () => {
  const [queue, setQueue] = useQueue();

  return (
    <section className="flex flex-col gap-2">
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
        <ul className="divide-y divide-white/10">
          {queue.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} onRemove={(id) => queueAPI.remove(id).catch(console.error)} />
          ))}
        </ul>
      </DragDropProvider>

      <button className="rounded bg-white/10 px-4 py-2 text-white hover:bg-red-500/30" onClick={() => queueAPI.clear().catch(console.error)}>
        Limpiar cola
      </button>
    </section>
  )
}