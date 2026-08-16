import { ExternalLink, Smartphone } from "lucide-react";

export const ControlHeader = () => {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b-2 border-ink bg-surface px-6 py-3">
      <h1 className="text-xl font-bold uppercase tracking-tight">Panel de control</h1>
      <nav className="flex flex-wrap items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex cursor-pointer items-center gap-2 border-2 border-ink bg-surface-card px-4 py-2 font-bold uppercase text-ink hover:bg-ink hover:text-surface-card"
        >
          <Smartphone className="h-4 w-4" />
          Vista de cliente
        </a>
        <a
          href="/player"
          target="_blank"
          rel="noreferrer"
          className="flex cursor-pointer items-center gap-2 border-2 border-ink bg-surface-card px-4 py-2 font-bold uppercase text-ink hover:bg-ink hover:text-surface-card"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir reproductor
        </a>
      </nav>
    </header>
  );
};
