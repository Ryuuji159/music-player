import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mediaAPI } from '~/api/media';

export const mediaKeys = {
  search: (q: string) => ['media', 'search', q] as const,
};

export function useMediaSearch(q: string) {
  const query = q.trim();

  return useQuery({
    queryKey: mediaKeys.search(query),
    queryFn: () => mediaAPI.search(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
