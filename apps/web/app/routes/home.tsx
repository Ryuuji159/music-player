import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import { YoutubePlayer, type PlayerAction } from "~/components/YoutubePlayer";
import { Queue } from "~/components/Queue";
import { useRealtime } from "~/context/RealtimeContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Player" },
  ];
}

export default function Home() {
  const playerActionRef = useRef<PlayerAction>(null);
  const { lastEvent } = useRealtime();
  const [videoIdInput, setVideoIdInput] = useState<string>('K4k1t1Misrk');
  const [videoId, setVideoId] = useState("K4k1t1Misrk");

  useEffect(() => {
    if (!lastEvent || lastEvent.type !== 'player.command') return;

    console.log(lastEvent);

    if(lastEvent.data.action === 'play' && lastEvent.data.videoId) {
      playerActionRef.current?.play(lastEvent.data.videoId);
    } else {
      playerActionRef.current?.pause();
    }
  }, [lastEvent]);


  return <div className="max-h-screen h-screen w-screen bg-black">
    <div className="grid grid-cols-12 h-full">
      <div className="col-span-10">
        <YoutubePlayer videoId={videoId} ref={playerActionRef} />
      </div>
      <div className="col-span-2 flex min-h-0 flex-col gap-2 m-2">
        <Queue />
      </div>
    </div>
  </div>
}
