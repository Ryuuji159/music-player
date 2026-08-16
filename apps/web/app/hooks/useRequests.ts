import { useMutation, useQuery } from '@tanstack/react-query';
import { requestsAPI } from '~/api/requests';

export const requestKeys = {
  all: ['requests'] as const,
};

export function useRequests() {
  return useQuery({
    queryKey: requestKeys.all,
    queryFn: requestsAPI.list,
    staleTime: Infinity,
  });
}

export function useCreateRequest() {
  return useMutation({ mutationFn: requestsAPI.create });
}

export function useApproveRequest() {
  return useMutation({ mutationFn: requestsAPI.approve });
}

export function useRejectRequest() {
  return useMutation({ mutationFn: requestsAPI.reject });
}
