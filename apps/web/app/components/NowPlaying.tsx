import { useQueue } from "~/hooks/useQueue"

export const NowPlaying = () => {
    const [queue] = useQueue();
    const current = queue.find((i) => i.status === "playing" || i.status === "paused");

    if (!current) return null;

    return (
        <div className="flex items-center gap-3 border-2 border-ink bg-surface-card p-3">
            <img src={current.media.thumbnailUrl} alt="" className="h-12 w-16 object-cover" />
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">Sonando ahora</p>
                <p className="truncate font-semibold text-ink">{current.media.title}</p>
                <p className="truncate text-sm text-ink-muted">{current.media.channelTitle}</p>
            </div>
        </div>
    )
}
