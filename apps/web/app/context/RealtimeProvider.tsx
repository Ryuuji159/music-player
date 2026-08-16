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
  children: ReactNode;
};

export const RealTimeProvider = ({ children }: Props) => {
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
    const eventSource = createRealtimeClient();

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

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Se perdió la conexión SSE');
    };

    eventSource.addEventListener('queue.updated', dispatch);
    eventSource.addEventListener('player.command', dispatch);
    eventSource.addEventListener('requests.updated', dispatch);

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'queue.updated') {
        queryClient.setQueryData(queueKeys.all, event.data);
      }
      if (event.type === 'requests.updated') {
        queryClient.setQueryData(requestKeys.all, event.data);
      }
    });
  }, [subscribe, queryClient]);

  return (
    <RealtimeContext.Provider value={{ subscribe, isConnected, error }}>
      {children}
    </RealtimeContext.Provider>
  );
};
