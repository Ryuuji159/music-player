import { z } from 'zod';
import { songRequestListSchema, type SongRequestDto } from '@skrd/contracts';
import { request } from './http';

export const requestsAPI = {
  list: (): Promise<SongRequestDto[]> => {
    return request('/requests', songRequestListSchema);
  },
  create: (url: string) => {
    return request('/requests', z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  approve: (id: string) => {
    return request(`/requests/${id}/approve`, z.unknown(), { method: 'POST' });
  },
  reject: (id: string) => {
    return request(`/requests/${id}/reject`, z.unknown(), { method: 'POST' });
  },
};
