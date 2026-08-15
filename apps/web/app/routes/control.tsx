import type { Route } from "./+types/control";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { playerAPI } from "~/api/player";
import { QueueManager } from "~/components/QueueManager";
import { AddSongForm } from "~/components/AddSongForm";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Control" }];
}

export default function Control() {
    const btn = "flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-surface-card px-4 py-2 font-bold uppercase text-ink hover:bg-ink hover:text-surface-card";

    return (
        <div className="min-h-screen w-screen bg-surface text-ink p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
                <h1 className="text-2xl font-bold uppercase tracking-tight">Panel de control</h1>

                <AddSongForm />

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button className={btn} onClick={() => playerAPI.previous().catch(console.error)}>
                        <SkipBack className="h-4 w-4" />
                        Anterior
                    </button>
                    <button className="flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-accent px-4 py-2 font-bold uppercase text-accent-ink hover:bg-accent/90" onClick={() => playerAPI.play().catch(console.error)}>
                        <Play className="h-4 w-4" />
                        Reproducir
                    </button>
                    <button className={btn} onClick={() => playerAPI.pause().catch(console.error)}>
                        <Pause className="h-4 w-4" />
                        Pausar
                    </button>
                    <button className={btn} onClick={() => playerAPI.next().catch(console.error)}>
                        <SkipForward className="h-4 w-4" />
                        Siguiente
                    </button>
                </div>

                <QueueManager />
            </div>
        </div>
    );
}
