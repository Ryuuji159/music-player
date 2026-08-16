import { mediaListSchema, type MediaItemDto } from '@skrd/contracts';
import { request } from './http';

export const mediaAPI = {
  search: (slug: string, q: string): Promise<MediaItemDto[]> => {
    return request(
      `/venues/${slug}/media?q=${encodeURIComponent(q)}`,
      mediaListSchema,
    );
  },
};
