import { z } from 'zod';
import { queueSchema, type QueueItemDto } from '@skrd/contracts';
import { request } from './http';

export const queueAPI = {
  current: (slug: string): Promise<QueueItemDto[]> => {
    return request(`/venues/${slug}/queue`, queueSchema);
  },
  append: (slug: string, url: string) => {
    return request(`/venues/${slug}/queue/append`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  appendVideo: (slug: string, videoId: string) => {
    return request(`/venues/${slug}/queue/append/video/${videoId}`, z.unknown(), {
      method: 'POST',
    });
  },
  move: (
    slug: string,
    id: string,
    siblingId: string,
    placement: 'before' | 'after',
  ) => {
    return request(`/venues/${slug}/queue/item/${id}/move`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ siblingId, placement }),
    });
  },
  remove: (slug: string, id: string) => {
    return request(`/venues/${slug}/queue/item/${id}`, z.unknown(), {
      method: 'DELETE',
    });
  },
  clear: (slug: string) => {
    return request(`/venues/${slug}/queue/clear`, z.unknown(), {
      method: 'DELETE',
    });
  },
};
