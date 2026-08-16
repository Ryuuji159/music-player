import { z } from 'zod';
import {
  playlistDetailSchema,
  playlistListSchema,
  type PlaylistDetailDto,
  type PlaylistDto,
} from '@skrd/contracts';
import { request } from './http';

export const playlistAPI = {
  list: (slug: string): Promise<PlaylistDto[]> => {
    return request(`/venues/${slug}/playlist`, playlistListSchema);
  },
  get: (slug: string, id: string): Promise<PlaylistDetailDto> => {
    return request(`/venues/${slug}/playlist/${id}`, playlistDetailSchema);
  },
  register: (slug: string, url: string) => {
    return request(`/venues/${slug}/playlist`, z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  remove: (slug: string, id: string) => {
    return request(`/venues/${slug}/playlist/${id}`, z.unknown(), {
      method: 'DELETE',
    });
  },
};
