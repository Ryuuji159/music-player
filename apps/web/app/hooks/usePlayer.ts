import { useMutation } from '@tanstack/react-query';
import { playerAPI } from '~/api/player';

export function usePlayerActions(slug: string) {
  const play = useMutation({ mutationFn: () => playerAPI.play(slug) });
  const pause = useMutation({ mutationFn: () => playerAPI.pause(slug) });
  const next = useMutation({ mutationFn: () => playerAPI.next(slug) });
  const previous = useMutation({ mutationFn: () => playerAPI.previous(slug) });
  const ended = useMutation({ mutationFn: () => playerAPI.ended(slug) });
  const error = useMutation({
    mutationFn: (code: number) => playerAPI.error(slug, code),
  });
  const playItem = useMutation({
    mutationFn: (id: string) => playerAPI.playItem(slug, id),
  });

  return { play, pause, next, previous, ended, error, playItem };
}
