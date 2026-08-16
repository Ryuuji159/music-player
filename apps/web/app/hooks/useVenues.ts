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
    mutationFn: (args: { name: string; slug?: string }) =>
      venuesAPI.create(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: string;
      input: Parameters<typeof venuesAPI.update>[1];
    }) => venuesAPI.update(args.id, args.input),
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
