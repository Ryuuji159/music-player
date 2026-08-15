import { useQueue } from "~/hooks/useQueue"

export const NowPlaying = () => {
    const [queue] = useQueue();
    const current = queue.find((i) => i.status === "playing" || i.status === "paused");

    if (!current) return null;

    return (
        <div className="flex items-center gap-3 rounded bg-white/5 p-3">
            <img src={current.media.thumbnailUrl} alt="" className="h-12 rounded" />
            <div className="min-w-0">
                <p className="truncate font-medium">Sonando: {current.media.title}</p>
                <p className="truncate text-sm text-gray-400">{current.media.channelTitle}</p>
            </div>
        </div>
    )
}