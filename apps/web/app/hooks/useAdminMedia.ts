import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { mediaAPI } from '~/api/media';

export const adminMediaKeys = {
  list: (q: string) => ['admin', 'media', q] as const,
};

export function useAdminMedia(q: string) {
  return useQuery({
    queryKey: adminMediaKeys.list(q),
    queryFn: () => mediaAPI.adminList(q),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaAPI.adminRemove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}
