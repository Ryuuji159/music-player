import type { RealtimeEvent } from '@skrd/contracts';
import { createContext, useContext } from 'react';

type RealtimeContextValue = {
  lastEvent: RealtimeEvent | null;
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
