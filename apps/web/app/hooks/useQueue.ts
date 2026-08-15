import type { QueueItemDto } from "@skrd/contracts";
import { useEffect, useState } from "react";
import { queueAPI } from "~/api/queue";
import { useRealtime } from "~/context/RealtimeContext";

export function useQueue() {
    const {lastEvent} = useRealtime();
    const [queue, setQueue] = useState<QueueItemDto[]>([]);

    useEffect(() => {
        queueAPI.current().then(setQueue).catch(console.error);
    }, []);

    useEffect(() => {
        if(lastEvent?.type === 'queue.updated') setQueue(lastEvent.data);
    }, [lastEvent]);

    return [queue, setQueue] as const;
}