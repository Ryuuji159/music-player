import type { Route } from "./+types/control";
import { QueueManager } from "~/components/QueueManager";
import { AddSongForm } from "~/components/AddSongForm";
import { AddPlaylist } from "~/components/AddPlaylist";
import { MediaLibrary } from "~/components/MediaLibrary";
import { SongRequests } from "~/components/SongRequests";
import { ControlHeader } from "~/components/ControlHeader";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Control" }];
}

export default function Control() {
    return (
        <div className="flex min-h-screen w-screen flex-col bg-background text-foreground">
            <ControlHeader />

            <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_460px]">
                <aside className="flex flex-col gap-6">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Añadir canción</h2>
                        <AddSongForm />
                    </section>

                    <MediaLibrary />

                    <AddPlaylist />

                    <SongRequests />
                </aside>

                <section className="flex flex-col gap-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:min-h-0 lg:self-start">
                    <h2 className="shrink-0 text-sm font-bold uppercase tracking-wide text-muted-foreground">Cola actual</h2>
                    <QueueManager />
                </section>
            </main>
        </div>
    );
}
