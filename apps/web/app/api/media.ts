import { mediaListSchema, type MediaItemDto } from '@skrd/contracts';
import { request } from './http';

export const mediaAPI = {
  search: (q: string): Promise<MediaItemDto[]> => {
    return request(`/media?q=${encodeURIComponent(q)}`, mediaListSchema);
  },
};
