import { AddSongForm } from "~/components/AddSongForm";
import { NowPlaying } from "~/components/NowPlaying";
import { Queue } from "~/components/Queue";

export default function Client() {
    return (
        <div className="min-h-screen w-screen bg-black text-white">
            <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
                <header className="flex flex-col items-center gap-2 pt-6">
                    <h1 className="text-2xl font-bold">Pide tu canción</h1>
                    <p className="text-sm text-gray-400">Pega una URL de YouTube para añadirla a la cola</p>
                </header>

                <NowPlaying />

                <AddSongForm />

                <div className="mt-2">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Cola</h2>
                    <Queue />
                </div>
            </div>
        </div>

    )
}