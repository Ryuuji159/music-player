import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { venuesAPI } from '~/api/venues';

export const venueKeys = {
  all: ['venues'] as const,
};

export function useVenues() {
  return useQuery({
    queryKey: venueKeys.all,
    queryFn: venuesAPI.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { slug: string; name: string }) =>
      venuesAPI.create(args.slug, args.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}

export function useRemoveVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: venuesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}
