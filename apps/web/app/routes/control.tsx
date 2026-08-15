import type { Route } from "./+types/control";
import { playerAPI } from "~/api/player";
import { QueueManager } from "~/components/QueueManager";
import { AddSongForm } from "~/components/AddSongForm";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Control" }];
}

export default function Control() {
    const btn = "rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20";

    return (
        <div className="min-h-screen w-screen bg-black text-white p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
                <AddSongForm />

                <div className="flex gap-2">
                    <button className={btn} onClick={() => playerAPI.previous().catch(console.error)}>⏮</button>
                    <button className={btn} onClick={() => playerAPI.play().catch(console.error)}>▶</button>
                    <button className={btn} onClick={() => playerAPI.pause().catch(console.error)}>⏸</button>
                    <button className={btn} onClick={() => playerAPI.next().catch(console.error)}>⏭</button>
                </div>

                <QueueManager />
            </div>
        </div>
    );
}