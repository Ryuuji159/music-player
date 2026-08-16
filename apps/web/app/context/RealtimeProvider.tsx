import { useEffect, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeContext } from "./RealtimeContext";
import { createRealtimeClient } from "./realtime.client";
import { realtimeEventSchema, type RealtimeEvent } from "@skrd/contracts";
import { queueKeys } from "~/hooks/useQueue";

type Props = {
    children: ReactNode;
}

export const RealTimeProvider = ({ children }: Props) => {
    const queryClient = useQueryClient();
    const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const eventSource = createRealtimeClient();

        const handleEvent = (event: Event) => {
            const message = event as MessageEvent<string>;

            try {
                const parsed = realtimeEventSchema.parse({
                    type: message.type,
                    data: JSON.parse(message.data),
                });
                setLastEvent(parsed);

                if (parsed.type === "queue.updated") {
                    queryClient.setQueryData(queueKeys.all, parsed.data);
                }
            } catch {
                setError("No se pudo interpretar el evento SSE");
            }
        };

        eventSource.onopen = () => {
            setIsConnected(true);
            setError(null);
        }

        eventSource.onerror = () => {
            setIsConnected(false);
            setError("Se perdió la conexión SSE");
        }

        eventSource.addEventListener("queue.updated", handleEvent);
        eventSource.addEventListener("player.command", handleEvent);

        return () => {
            eventSource.close();
        }
    }, []);

    return (
        <RealtimeContext.Provider value={{ lastEvent, isConnected, error }}>
            {children}
        </RealtimeContext.Provider>
    )
}