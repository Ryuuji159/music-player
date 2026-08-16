import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { playlistAPI } from '~/api/playlist';

const PLAYLIST_STALE_TIME = 5 * 60 * 1000;

export const playlistKeys = {
  all: ['playlists'] as const,
  list: (slug: string) => ['playlists', slug, 'list'] as const,
  detail: (slug: string, id: string) =>
    ['playlists', slug, 'detail', id] as const,
};

export function usePlaylists(slug: string) {
  return useQuery({
    queryKey: playlistKeys.list(slug),
    queryFn: () => playlistAPI.list(slug),
    staleTime: PLAYLIST_STALE_TIME,
  });
}

export function usePlaylist(slug: string, id: string | null) {
  return useQuery({
    queryKey: playlistKeys.detail(slug, id ?? ''),
    queryFn: () => playlistAPI.get(slug, id!),
    enabled: id !== null,
    staleTime: PLAYLIST_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useRegisterPlaylist(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => playlistAPI.register(slug, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}

export function useRemovePlaylist(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playlistAPI.remove(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}
