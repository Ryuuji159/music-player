import type { Route } from './+types/client';
import { AddSongForm } from '~/components/AddSongForm';
import { NowPlaying } from '~/components/NowPlaying';
import { Queue } from '~/components/Queue';
import { Card } from '~/components/ui/card';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Pide tu canción' }];
}

export default function Client() {
  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-col items-center gap-2 pt-6">
          <h1 className="font-heading text-2xl font-medium uppercase tracking-tight">
            Pide tu canción
          </h1>
          <p className="text-sm text-muted-foreground">
            Pega una URL de YouTube para añadirla a la cola
          </p>
        </header>

        <NowPlaying />

        <AddSongForm />

        <div className="mt-2">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Cola
          </h2>
          <Card className="overflow-hidden py-0">
            <Queue />
          </Card>
        </div>
      </div>
    </div>
  );
}
