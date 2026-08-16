import { useMutation, useQuery } from '@tanstack/react-query';
import { requestsAPI } from '~/api/requests';

export const requestKeys = {
  all: ['requests'] as const,
  list: (slug: string) => ['requests', slug] as const,
};

export function useRequests(slug: string) {
  return useQuery({
    queryKey: requestKeys.list(slug),
    queryFn: () => requestsAPI.list(slug),
    staleTime: Infinity,
    retry: false,
  });
}

export function useCreateRequest(slug: string) {
  return useMutation({
    mutationFn: (args: { url: string; requestedBy?: string }) =>
      requestsAPI.create(slug, args.url, args.requestedBy),
  });
}

export function useApproveRequest(slug: string) {
  return useMutation({ mutationFn: (id: string) => requestsAPI.approve(slug, id) });
}

export function useRejectRequest(slug: string) {
  return useMutation({ mutationFn: (id: string) => requestsAPI.reject(slug, id) });
}
