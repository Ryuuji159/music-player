import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inviteAPI } from '~/api/invite';

export function useInvite(slug: string) {
  return useQuery({
    queryKey: ['invite', slug],
    queryFn: () => inviteAPI.current(slug),
    refetchInterval: 30_000,
  });
}

export function useRotateInvite(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inviteAPI.rotate(slug),
    onSuccess: (invite) => {
      queryClient.setQueryData(['invite', slug], invite);
    },
  });
}
