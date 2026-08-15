import React, { useEffect, useImperativeHandle, useRef } from "react";

export interface PlayerAction {
  play: (videoId: string | null) => void;
  pause: () => void;
  stop: () => void;
}

type Props = {
  onEnded: () => void;
  ref?: React.Ref<PlayerAction>;
}

export const YoutubePlayer = ({ onEnded, ref }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player>(null);
  const onEndedRef = useRef(onEnded);
  const pendingVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useImperativeHandle(ref, () => ({
    play(videoId) {
      if (videoId) {
        pendingVideoIdRef.current = videoId;
        if (playerRef.current) {
          playerRef.current.loadVideoById(videoId);
          pendingVideoIdRef.current = null;
        }
      } else if (playerRef.current) {
        playerRef.current.playVideo();
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
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1 },
        events: {
          onReady: (event) => {
            const pending = pendingVideoIdRef.current;
            if(pending) {
              playerRef.current?.loadVideoById(pending);
              pendingVideoIdRef.current = null;
            }
          },
          onStateChange: (event) => {
            if(event.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = createPlayer;

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    }
  }, []);

  return <div ref={containerRef} className="h-full w-full"/>;
}