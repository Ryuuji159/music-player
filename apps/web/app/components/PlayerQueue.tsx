import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useQueue } from "~/hooks/useQueue";

export const PlayerQueue = () => {
    const [queue] = useQueue();
    const listRef = useRef<HTMLUListElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const currentIndex = queue.findIndex((i) => i.status === "playing" || i.status === "paused");
    const currentId = currentIndex >= 0 ? queue[currentIndex].id : undefined;

    useEffect(() => {
        if (!currentId || !listRef.current) return;
        const el = listRef.current.querySelector("[data-current]");
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [currentId]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        } else {
            document.documentElement.requestFullscreen().catch(console.error);
        }
    };

    if (queue.length === 0) {
        return <p className="p-4 text-ink-muted">La cola está vacía</p>;
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                    En cola · {currentIndex >= 0 ? currentIndex + 1 : 0} / {queue.length}
                </span>
                <button
                    className="cursor-pointer text-ink-muted hover:text-ink"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
            </div>
            <ul ref={listRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {queue.map((item) => {
                    const isCurrent = item.status === "playing" || item.status === "paused";
                    return (
                        <li
                            key={item.id}
                            data-current={isCurrent ? "true" : undefined}
                            className={`flex gap-3 p-3 ${isCurrent ? "border-l-4 border-accent bg-accent/15" : "border-l-4 border-transparent border-b border-line last:border-b-0"}`}
                        >
                            <img
                                src={item.media.thumbnailUrl}
                                alt=""
                                className="h-14 w-24 shrink-0 object-cover"
                            />
                            <div className="min-w-0">
                                <p className={`line-clamp-2 leading-tight text-ink ${isCurrent ? "font-semibold" : ""}`}>
                                    {item.media.title}
                                </p>
                                <p className="truncate text-sm text-ink-muted">{item.media.channelTitle}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
