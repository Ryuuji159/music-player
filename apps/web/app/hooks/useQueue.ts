import { useMutation, useQuery } from '@tanstack/react-query';
import { queueAPI } from '~/api/queue';

export const queueKeys = {
  all: ['queue'] as const,
  list: (slug: string) => ['queue', slug] as const,
};

export function useQueue(slug: string) {
  return useQuery({
    queryKey: queueKeys.list(slug),
    queryFn: () => queueAPI.current(slug),
    staleTime: Infinity,
    retry: false,
  });
}

export function useAppendToQueue(slug: string) {
  return useMutation({ mutationFn: (url: string) => queueAPI.append(slug, url) });
}

export function useAppendVideoToQueue(slug: string) {
  return useMutation({
    mutationFn: (videoId: string) => queueAPI.appendVideo(slug, videoId),
  });
}

export function useMoveQueueItem(slug: string) {
  return useMutation({
    mutationFn: (args: {
      id: string;
      siblingId: string;
      placement: 'before' | 'after';
    }) => queueAPI.move(slug, args.id, args.siblingId, args.placement),
  });
}

export function useRemoveQueueItem(slug: string) {
  return useMutation({ mutationFn: (id: string) => queueAPI.remove(slug, id) });
}

export function useClearQueue(slug: string) {
  return useMutation({ mutationFn: () => queueAPI.clear(slug) });
}
