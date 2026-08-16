import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { UserDto } from '@skrd/contracts';
import { authAPI } from '~/api/auth';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function userHome(user: UserDto): string {
  if (user.role === 'admin') return '/admin';
  if (user.venues.length === 1) return `/${user.venues[0].slug}/control`;
  return '/select';
}

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
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (args: { email: string; password: string }) =>
      authAPI.login(args.email, args.password),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      navigate(userHome(user), { replace: true });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
      navigate('/admin', { replace: true });
    },
  });
}
