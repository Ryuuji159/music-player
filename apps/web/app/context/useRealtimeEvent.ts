import { useEffect, useRef } from 'react';
import type { RealtimeEvent } from '@skrd/contracts';
import { useRealtime } from './RealtimeContext';

type RealtimeEventByType<K extends RealtimeEvent['type']> = Extract<
  RealtimeEvent,
  { type: K }
>;

export function useRealtimeEvent<K extends RealtimeEvent['type']>(
  type: K,
  handler: (event: RealtimeEventByType<K>) => void,
): void {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === type) {
        handlerRef.current(event as RealtimeEventByType<K>);
      }
    });
  }, [subscribe, type]);
}
