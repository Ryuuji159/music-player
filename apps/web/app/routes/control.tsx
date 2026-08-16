import type { Route } from "./+types/control";
import { SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { playerAPI } from "~/api/player";
import { QueueManager } from "~/components/QueueManager";
import { AddSongForm } from "~/components/AddSongForm";
import { AddPlaylist } from "~/components/AddPlaylist";
import { SongRequests } from "~/components/SongRequests";
import { ControlHeader } from "~/components/ControlHeader";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Control" }];
}

export default function Control() {
    const btn = "flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-surface-card px-4 py-2 font-bold uppercase text-ink hover:bg-ink hover:text-surface-card";

    return (
        <div className="flex min-h-screen w-screen flex-col bg-surface text-ink lg:h-screen lg:overflow-hidden">
            <ControlHeader />

            <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 p-6 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px]">
                <aside className="flex flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Añadir canción</h2>
                        <AddSongForm />
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Reproducción</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button className="flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-accent px-4 py-2 font-bold uppercase text-accent-ink hover:bg-accent/90" onClick={() => playerAPI.play().catch(console.error)}>
                                <Play className="h-4 w-4" />
                                Reproducir
                            </button>
                            <button className={btn} onClick={() => playerAPI.pause().catch(console.error)}>
                                <Pause className="h-4 w-4" />
                                Pausar
                            </button>
                            <button className={btn} onClick={() => playerAPI.previous().catch(console.error)}>
                                <SkipBack className="h-4 w-4" />
                                Anterior
                            </button>
                            <button className={btn} onClick={() => playerAPI.next().catch(console.error)}>
                                <SkipForward className="h-4 w-4" />
                                Siguiente
                            </button>
                        </div>
                    </section>

                    <AddPlaylist />

                    <SongRequests />
                </aside>

                <section className="flex min-h-0 flex-col gap-2">
                    <h2 className="shrink-0 text-sm font-bold uppercase tracking-wide text-ink-muted">Cola actual</h2>
                    <QueueManager />
                </section>
            </main>
        </div>
    );
}
