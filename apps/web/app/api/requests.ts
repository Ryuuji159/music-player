import { z } from 'zod';
import { songRequestListSchema, type SongRequestDto } from '@skrd/contracts';
import { request } from './http';

export const requestsAPI = {
  list: (slug: string): Promise<SongRequestDto[]> => {
    return request(`/venues/${slug}/requests`, songRequestListSchema);
  },
  create: (slug: string, url: string, requestedBy?: string) => {
    return request(`/venues/${slug}/requests`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ url, requestedBy }),
    });
  },
  approve: (slug: string, id: string) => {
    return request(`/venues/${slug}/requests/${id}/approve`, z.unknown(), {
      method: 'POST',
    });
  },
  reject: (slug: string, id: string) => {
    return request(`/venues/${slug}/requests/${id}/reject`, z.unknown(), {
      method: 'POST',
    });
  },
};
