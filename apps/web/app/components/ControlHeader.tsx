import { ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const ControlHeader = () => {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b bg-background px-6 py-3">
      <h1 className="font-heading text-xl font-medium">Panel de control</h1>
      <nav className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          render={<a href="/" target="_blank" rel="noreferrer" />}
        >
          <Smartphone data-icon="inline-start" />
          Vista de cliente
        </Button>
        <Button
          variant="outline"
          render={<a href="/player" target="_blank" rel="noreferrer" />}
        >
          <ExternalLink data-icon="inline-start" />
          Abrir reproductor
        </Button>
      </nav>
    </header>
  );
};
