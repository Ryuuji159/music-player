import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mediaAPI } from '~/api/media';

export const mediaKeys = {
  search: (slug: string, q: string) => ['media', slug, 'search', q] as const,
};

export function useMediaSearch(slug: string, q: string) {
  const query = q.trim();

  return useQuery({
    queryKey: mediaKeys.search(slug, query),
    queryFn: () => mediaAPI.search(slug, query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
