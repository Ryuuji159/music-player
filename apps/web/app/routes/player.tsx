import { useEffect, useRef } from "react";
import type { Route } from "../+types/root";
import { YoutubePlayer, type PlayerAction } from "~/components/YoutubePlayer";
import { useRealtime } from "~/context/RealtimeContext";
import { playerAPI } from "~/api/player";
import { Queue } from "~/components/Queue";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Player" }];
}

export default function Player() {
    const playerActionRef = useRef<PlayerAction>(null);
    const { lastEvent } = useRealtime();

    useEffect(() => {
        playerAPI.play().catch(console.error);
    }, [])

    useEffect(() => {
        if (!lastEvent || lastEvent.type !== "player.command") return;

        const { action, videoId } = lastEvent.data;

        if (action === "play") playerActionRef.current?.play(videoId);
        else if (action === "pause") playerActionRef.current?.pause();
        else if (action === "stop") playerActionRef.current?.stop();
    }, [lastEvent]);

    const btn = "rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20";

    return (
        <div className="max-h-screen h-screen w-screen bg-black">
            <div className="grid grid-cols-12 h-full">
                <div className="col-span-10">
                    <YoutubePlayer
                        ref={playerActionRef}
                        onEnded={() => playerAPI.ended().catch(console.error)}
                    />
                </div>
                <div className="col-span-2 flex min-h-0 flex-col gap-2 m-2">
                    <Queue/>
                    <div className="flex gap-2">
                        <button className={btn} onClick={() => playerAPI.previous().catch(console.error)}>⏮</button>
                        <button className={btn} onClick={() => playerAPI.play().catch(console.error)}>▶</button>
                        <button className={btn} onClick={() => playerAPI.pause().catch(console.error)}>⏸</button>
                        <button className={btn} onClick={() => playerAPI.next().catch(console.error)}>⏭</button>
                    </div>
                </div>
            </div>
        </div>
    )
}