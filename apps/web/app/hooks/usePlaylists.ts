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
  list: () => [...playlistKeys.all, 'list'] as const,
  detail: (id: string) => [...playlistKeys.all, 'detail', id] as const,
};

export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.list(),
    queryFn: playlistAPI.list,
    staleTime: PLAYLIST_STALE_TIME,
  });
}

export function usePlaylist(id: string | null) {
  return useQuery({
    queryKey: playlistKeys.detail(id ?? ''),
    queryFn: () => playlistAPI.get(id!),
    enabled: id !== null,
    staleTime: PLAYLIST_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useRegisterPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playlistAPI.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}

export function useRemovePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playlistAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}
