import { useEffect, useImperativeHandle, useRef } from "react";

export interface PlayerAction {
  play: (videoId: string | null) => void;
  pause: () => void;
}

export const YoutubePlayer = ({ videoId, ref }: { videoId: string, ref: React.Ref<PlayerAction> }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player>(null);

  useImperativeHandle(ref, () => ({
    play(videoId: string | null) {
      console.log("PLAY???");

      if(videoId) {
        playerRef.current?.loadVideoById(videoId);
      } else {
        playerRef.current?.playVideo();
      }
    },

    pause() {
      console.log("Pause???");
      playerRef.current?.pauseVideo();
    }
  }));

  useEffect(() => {
    const createPlayer = () => {
      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,

        width: "100%",
        height: "100%",

        playerVars: {
          playsinline: 1
        },

        events: {
          onReady: (event) => {
            console.log("Player listo", event.target);
          },

          onStateChange: (event) => {
            console.log("Estado:", event.data);
          },

          onError: (event) => {
            console.error("Error de YouTube:", event.data);
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

  useEffect(() => {
    console.log(videoId);
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  return <div ref={containerRef} />;
}