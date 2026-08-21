import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '~/api/settings';

export const settingsKeys = {
  all: ['settings'] as const,
  venue: (slug: string) => [...settingsKeys.all, slug] as const,
};

export function useVenueSettings(slug: string) {
  return useQuery({
    queryKey: settingsKeys.venue(slug),
    queryFn: () => settingsAPI.get(slug),
  });
}

export function useUpdateVenueSettings(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skipOnError: boolean) =>
      settingsAPI.update(slug, skipOnError),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.venue(slug), data);
    },
  });
}
