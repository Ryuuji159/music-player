import { useEffect, useRef } from "react";
import type { Route } from "./+types/player";
import { YoutubePlayer, type PlayerAction } from "~/components/YoutubePlayer";
import { useRealtime } from "~/context/RealtimeContext";
import { playerAPI } from "~/api/player";
import { Queue } from "~/components/Queue";
import { QueueManager } from "~/components/QueueManager";

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
                </div>
            </div>
        </div>
    )
}