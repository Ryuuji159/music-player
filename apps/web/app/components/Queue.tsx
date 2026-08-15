import { useQueue } from "~/hooks/useQueue";

export const Queue = () => {
    const [queue] = useQueue();
    return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <p className="p-3 text-ink-muted">La cola está vacía</p>
        ) : (
          <ul className="divide-y divide-line">
            {queue.map((item, index) => {
              const isCurrent = item.status === "playing" || item.status === "paused";
              return (
                <li key={item.id} className={`grid grid-cols-12 gap-1 ${isCurrent ? "bg-accent/10" : ""}`}>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-ink-muted">{index + 1}</span>
                  </div>
                  <div className="col-span-3 p-px">
                    <img src={item.media.thumbnailUrl} alt="" className="object-contain" />
                  </div>
                  <div className="min-w-0 col-span-8 flex flex-col justify-center">
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
