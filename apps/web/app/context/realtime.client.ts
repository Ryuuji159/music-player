import { env } from '~/config/env';

export function createRealtimeClient() {
  return new EventSource(`${env.eventsUrl}`);
}
