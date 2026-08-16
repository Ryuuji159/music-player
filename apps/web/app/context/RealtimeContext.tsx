import type { RealtimeEvent } from '@skrd/contracts';
import { createContext, useContext } from 'react';

export type RealtimeEventHandler = (event: RealtimeEvent) => void;
export type Unsubscribe = () => void;

type RealtimeContextValue = {
  subscribe: (handler: RealtimeEventHandler) => Unsubscribe;
  isConnected: boolean;
  error: string | null;
};

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined,
);

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime debe usarse dentro de RealtimeProvider');
  }

  return context;
}
