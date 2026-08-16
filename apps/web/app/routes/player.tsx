import { useEffect, useRef } from "react";
import type { Route } from "./+types/player";
import { YoutubePlayer, type PlayerAction } from "~/components/YoutubePlayer";
import { useRealtime } from "~/context/RealtimeContext";
import { usePlayerActions } from "~/hooks/usePlayer";
import { PlayerQueue } from "~/components/PlayerQueue";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Player" }];
}

export default function Player() {
    const playerActionRef = useRef<PlayerAction>(null);
    const { lastEvent } = useRealtime();
    const { play, ended, error } = usePlayerActions();

    useEffect(() => {
        play.mutate();
    }, [])

    useEffect(() => {
        if (!lastEvent || lastEvent.type !== "player.command") return;

        const { action, videoId } = lastEvent.data;

        if (action === "play") playerActionRef.current?.play(videoId);
        else if (action === "pause") playerActionRef.current?.pause();
        else if (action === "stop") playerActionRef.current?.stop();
    }, [lastEvent]);


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
                </div>
            </div>
        </div>
    )
}
