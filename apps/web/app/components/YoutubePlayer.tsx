import React, { useEffect, useImperativeHandle, useRef } from 'react';

export interface PlayerAction {
  play: (videoId: string | null) => void;
  pause: () => void;
  stop: () => void;
}

type Props = {
  onEnded: () => void;
  onError: (code: number) => void;
  ref?: React.Ref<PlayerAction>;
};

export const YoutubePlayer = ({ onEnded, onError, ref }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player>(null);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  const pendingVideoIdRef = useRef<string | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useImperativeHandle(ref, () => ({
    play(videoId) {
      if (!videoId) {
        playerRef.current?.playVideo();
        return;
      }

      if (currentVideoIdRef.current === videoId) {
        playerRef.current?.playVideo();
        return;
      }

      currentVideoIdRef.current = videoId;
      pendingVideoIdRef.current = videoId;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        pendingVideoIdRef.current = null;
      }
    },
    pause() {
      playerRef.current?.pauseVideo();
    },
    stop() {
      playerRef.current?.stopVideo();
    },
  }));

  useEffect(() => {
    const createPlayer = () => {
      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: '100%',
        height: '100%',
        playerVars: {},
        events: {
          onReady: (_event) => {
            const pending = pendingVideoIdRef.current;
            if (pending) {
              playerRef.current?.loadVideoById(pending);
              pendingVideoIdRef.current = null;
            }
          },
          onStateChange: (event) => {
            console.log(event.data);
            if (event.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
          onError: (event) => {
            if (typeof event.data === 'number') {
              onErrorRef.current?.(event.data);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = createPlayer;

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};
