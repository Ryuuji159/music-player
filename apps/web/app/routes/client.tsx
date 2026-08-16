import type { Route } from './+types/client';
import { RealTimeProvider } from '~/context/RealtimeProvider';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { useQueue } from '~/hooks/useQueue';
import { ApiError } from '~/api/http';
import { RequestSongForm } from '~/components/RequestSongForm';
import { Requests } from '~/components/Requests';
import { NowPlaying } from '~/components/NowPlaying';
import { Queue } from '~/components/Queue';
import { Card } from '~/components/ui/card';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Pide tu canción' }];
}

function ScanQrPrompt() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md p-6 text-center">
        <p className="font-heading text-lg font-medium">
          Escanea el QR de la pantalla
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Para unirte a la sesión, escanea el código QR que se muestra en la
          pantalla del bar.
        </p>
      </Card>
    </div>
  );
}

function ClientView() {
  const slug = useVenueSlug();
  const { error } = useQueue(slug);
  const unauthorized =
    error instanceof ApiError && error.details.statusCode === 401;

  if (unauthorized) return <ScanQrPrompt />;

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-col items-center gap-2 pt-6">
          <h1 className="font-heading text-2xl font-medium uppercase tracking-tight">
            Pide tu canción
          </h1>
          <p className="text-sm text-muted-foreground">
            Pega una URL de YouTube para solicitar una canción
          </p>
        </header>

        <NowPlaying />

        <RequestSongForm />

        <div className="mt-2">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Solicitudes
          </h2>
          <Card className="overflow-hidden py-0">
            <Requests />
          </Card>
        </div>

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

export default function Client() {
  const slug = useVenueSlug();

  return (
    <RealTimeProvider slug={slug}>
      <ClientView />
    </RealTimeProvider>
  );
}
