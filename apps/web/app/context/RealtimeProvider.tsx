import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeEventSchema, type RealtimeEvent } from '@skrd/contracts';
import { RealtimeContext, type RealtimeEventHandler } from './RealtimeContext';
import { createRealtimeClient } from './realtime.client';
import { queueKeys } from '~/hooks/useQueue';
import { requestKeys } from '~/hooks/useRequests';

type Props = {
  slug: string;
  children: ReactNode;
};

const RECONNECT_INITIAL_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;

export const RealTimeProvider = ({ slug, children }: Props) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlersRef = useRef<Set<RealtimeEventHandler> | null>(null);
  if (handlersRef.current === null) {
    handlersRef.current = new Set();
  }

  const subscribe = useCallback((handler: RealtimeEventHandler) => {
    handlersRef.current!.add(handler);
    return () => {
      handlersRef.current!.delete(handler);
    };
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = RECONNECT_INITIAL_DELAY;
    let disposed = false;

    const dispatch = (event: Event) => {
      const message = event as MessageEvent<string>;

      try {
        const parsed: RealtimeEvent = realtimeEventSchema.parse({
          type: message.type,
          data: JSON.parse(message.data),
        });

        for (const handler of [...handlersRef.current!]) {
          handler(parsed);
        }
      } catch {
        setError('No se pudo interpretar el evento SSE');
      }
    };

    const connect = () => {
      if (disposed) return;

      const source = createRealtimeClient(slug);
      eventSource = source;

      source.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectDelay = RECONNECT_INITIAL_DELAY;
      };

      source.onerror = () => {
        setIsConnected(false);
        setError('Se perdió la conexión SSE');
        source.close();
        if (eventSource === source) eventSource = null;

        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
      };

      source.addEventListener('queue.updated', dispatch);
      source.addEventListener('player.command', dispatch);
      source.addEventListener('requests.updated', dispatch);
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      eventSource?.close();
      eventSource = null;
    };
  }, [slug]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'queue.updated') {
        queryClient.setQueryData(queueKeys.list(slug), event.data);
      }
      if (event.type === 'requests.updated') {
        queryClient.setQueryData(requestKeys.list(slug), event.data);
      }
    });
  }, [subscribe, queryClient, slug]);

  return (
    <RealtimeContext.Provider value={{ subscribe, isConnected, error }}>
      {children}
    </RealtimeContext.Provider>
  );
};
