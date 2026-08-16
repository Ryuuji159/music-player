import { ListPlus } from "lucide-react";

export const AddPlaylist = () => {
  return (
    <section className="flex flex-col gap-2 border-2 border-line p-4">
      <div className="flex items-center gap-2">
        <ListPlus className="h-4 w-4 text-ink-muted" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Agregar playlist</h2>
      </div>
      <input
        disabled
        placeholder="Pega una URL de playlist de YouTube"
        className="w-full cursor-not-allowed border-2 border-line bg-surface-card px-3 py-2 text-ink-muted outline-none"
      />
      <button
        disabled
        className="cursor-not-allowed border-2 border-line px-4 py-2 font-bold uppercase tracking-wide text-ink-muted"
      >
        Añadir playlist
      </button>
      <p className="text-xs uppercase tracking-wide text-ink-muted">Próximamente</p>
    </section>
  );
};
