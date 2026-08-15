import { useState, type SubmitEventHandler } from "react";
import type { Route } from "./+types/control";
import { queueAPI } from "~/api/queue";
import { playerAPI } from "~/api/player";
import { QueueManager } from "~/components/QueueManager";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Control" }];
}

export default function Control() {
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const append: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await queueAPI.append(url);
            setUrl("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo añadir");
        }
    };

    const btn = "rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20";

    return (
        <div className="min-h-screen w-screen bg-black text-white p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
                <h1 className="text-2xl font-bold">Panel de control</h1>

                <form onSubmit={append} className="flex gap-2">
                    <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Pega una URL de YouTube"
                        className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-white outline-none focus:bg-white/15"
                    />
                    <button type="submit" className={btn}>Añadir</button>
                </form>
                {error && <p className="text-sm text-red-400">{error}</p>}

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