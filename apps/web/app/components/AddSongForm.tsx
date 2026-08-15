import { useState, type SubmitEventHandler } from "react"
import { ur } from "zod/locales";
import { queueAPI } from "~/api/queue";

export const AddSongForm = () => {
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

    const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setStatus(null);

        try {
            await queueAPI.append(url);
            setUrl("");
            setStatus({ type: "success", message: "Canción añadida a la cola" });
        } catch (err) {
            setStatus({ type: "error", message: err instanceof Error ? err.message : "No se pudo añadir" });
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <form onSubmit={submit} className="flex gap-2">
                <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Pega una URL de Youtube"
                    className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-white outline-none focus:bg-white/15"
                />
                <button type="submit" className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20">
                    Añadir
                </button>
            </form>
            {status && (
                <p className={`text-sm ${status.type === 'error' ? "text-red-400" : "text-green-400"}`}>
                    {status.message}
                </p>
            )}
        </div>
    )
}