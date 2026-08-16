import { useQueue } from "~/hooks/useQueue";

export const Queue = () => {
    const { data: queue = [] } = useQueue();
    return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <p className="p-3 text-ink-muted">La cola está vacía</p>
        ) : (
          <ul className="divide-y divide-line">
            {queue.map((item) => {
              const isCurrent = item.status === "playing" || item.status === "paused";
              return (
                <li key={item.id} className={`flex gap-3 ${isCurrent ? "bg-accent/10" : ""}`}>
                  <div className="shrink-0 p-px">
                    <img src={item.media.thumbnailUrl} alt="" className="h-12 w-20 object-cover" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="truncate font-medium text-ink">
                      {item.media.title}
                      {item.status === "playing" && <span className="text-accent"> ●</span>}
                      {item.status === "paused" && <span className="text-ink-muted"> ❚❚</span>}
                    </p>
                    <p className="truncate text-sm text-ink-muted">{item.media.channelTitle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
