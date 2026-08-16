import { Inbox } from "lucide-react";

export const SongRequests = () => {
  return (
    <section className="flex flex-col gap-2 border-2 border-line p-4">
      <div className="flex items-center gap-2">
        <Inbox className="h-4 w-4 text-ink-muted" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Solicitudes</h2>
      </div>
      <div className="flex flex-col items-center gap-2 border-2 border-dashed border-line px-3 py-6 text-center">
        <p className="text-sm text-ink-muted">Aún no hay solicitudes</p>
        <p className="text-xs uppercase tracking-wide text-ink-muted">Próximamente</p>
      </div>
    </section>
  );
};
