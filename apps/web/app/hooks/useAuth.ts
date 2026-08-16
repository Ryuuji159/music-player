import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '~/api/auth';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useAuth() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authAPI.me,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { username: string; password: string }) =>
      authAPI.login(args.username, args.password),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
    },
  });
}
