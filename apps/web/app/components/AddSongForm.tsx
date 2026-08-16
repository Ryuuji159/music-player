import { useState, type SubmitEventHandler } from "react"
import { useAppendToQueue } from "~/hooks/useQueue";

export const AddSongForm = () => {
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);
    const appendMutation = useAppendToQueue();

    const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setStatus(null);

        try {
            await appendMutation.mutateAsync(url);
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
                    placeholder="Pega una URL de YouTube"
                    className="min-w-0 flex-1 border-2 border-ink bg-surface-card px-3 py-2 text-ink outline-none focus:border-accent"
                />
                <button type="submit" className="cursor-pointer border-2 border-ink bg-accent px-4 py-2 font-bold uppercase tracking-wide text-accent-ink hover:bg-accent/90">
                    Añadir
                </button>
            </form>
            {status && (
                <p className={`text-sm ${status.type === 'error' ? "text-red-500" : "text-green-600"}`}>
                    {status.message}
                </p>
            )}
        </div>
    )
}
