import { useEffect, useRef } from 'react';
import type { Route } from './+types/player';
import { RealTimeProvider } from '~/context/RealtimeProvider';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { RequireAuth } from '~/components/RequireAuth';
import { YoutubePlayer, type PlayerAction } from '~/components/YoutubePlayer';
import { useRealtimeEvent } from '~/context/useRealtimeEvent';
import { usePlayerActions } from '~/hooks/usePlayer';
import { PlayerQueue } from '~/components/PlayerQueue';
import { VenueQrCode } from '~/components/VenueQrCode';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Player' }];
}

function PlayerView() {
  const slug = useVenueSlug();
  const playerActionRef = useRef<PlayerAction>(null);
  const { play, ended, error } = usePlayerActions(slug);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    play.mutate();
  }, [play]);

  useRealtimeEvent('player.command', (event) => {
    const { action, videoId } = event.data;

    if (action === 'play') playerActionRef.current?.play(videoId);
    else if (action === 'pause') playerActionRef.current?.pause();
    else if (action === 'stop') playerActionRef.current?.stop();
  });

  return (
    <div className="theme-dark max-h-screen h-screen w-screen bg-background text-foreground">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-9">
          <YoutubePlayer
            ref={playerActionRef}
            onEnded={() => ended.mutate()}
            onError={(code) => error.mutate(code)}
          />
        </div>
        <div className="col-span-3 flex min-h-0 flex-col gap-2 m-2">
          <PlayerQueue />
          <VenueQrCode />
        </div>
      </div>
    </div>
  );
}

export default function Player() {
  const slug = useVenueSlug();

  return (
    <RequireAuth>
      <RealTimeProvider slug={slug}>
        <PlayerView />
      </RealTimeProvider>
    </RequireAuth>
  );
}
