import { z } from 'zod';
import { request } from './http';

export const playerAPI = {
  next: (slug: string) => {
    return request(`/venues/${slug}/player/next`, z.unknown(), {
      method: 'POST',
    });
  },
  previous: (slug: string) => {
    return request(`/venues/${slug}/player/previous`, z.unknown(), {
      method: 'POST',
    });
  },
  play: (slug: string) => {
    return request(`/venues/${slug}/player/play`, z.unknown(), {
      method: 'POST',
    });
  },
  pause: (slug: string) => {
    return request(`/venues/${slug}/player/pause`, z.unknown(), {
      method: 'POST',
    });
  },
  ended: (slug: string) => {
    return request(`/venues/${slug}/player/events/ended`, z.unknown(), {
      method: 'POST',
    });
  },
  error: (slug: string, code: number) => {
    return request(`/venues/${slug}/player/events/error`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
  playItem: (slug: string, id: string) => {
    return request(`/venues/${slug}/player/item/${id}/play`, z.unknown(), {
      method: 'POST',
    });
  },
};
