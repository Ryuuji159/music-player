import {
  adminMediaListSchema,
  mediaListSchema,
  type AdminMediaItemDto,
  type MediaItemDto,
} from '@skrd/contracts';
import { z } from 'zod';
import { request } from './http';

export const mediaAPI = {
  search: (slug: string, q: string): Promise<MediaItemDto[]> => {
    return request(
      `/venues/${slug}/media?q=${encodeURIComponent(q)}`,
      mediaListSchema,
    );
  },
  adminList: (q: string): Promise<AdminMediaItemDto[]> => {
    return request(
      `/admin/media?q=${encodeURIComponent(q)}`,
      adminMediaListSchema,
    );
  },
  adminRemove: (id: string) => {
    return request(`/admin/media/${id}`, z.unknown(), { method: 'DELETE' });
  },
};
