import type { Route } from "./+types/client";
import { AddSongForm } from "~/components/AddSongForm";
import { NowPlaying } from "~/components/NowPlaying";
import { Queue } from "~/components/Queue";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Pide tu canción" }];
}

export default function Client() {
    return (
        <div className="min-h-screen w-screen bg-surface text-ink">
            <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
                <header className="flex flex-col items-center gap-2 pt-6">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Pide tu canción</h1>
                    <p className="text-sm text-ink-muted">Pega una URL de YouTube para añadirla a la cola</p>
                </header>

                <NowPlaying />

                <AddSongForm />

                <div className="mt-2">
                    <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">Cola</h2>
                    <div className="border-2 border-ink bg-surface-card">
                        <Queue />
                    </div>
                </div>
            </div>
        </div>
    )
}
