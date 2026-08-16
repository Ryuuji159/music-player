import { env } from '~/config/env';

export function createRealtimeClient(slug: string) {
  return new EventSource(`${env.eventsUrl}/${slug}`, { withCredentials: true });
}
