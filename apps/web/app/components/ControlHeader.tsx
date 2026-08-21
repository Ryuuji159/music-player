import { ExternalLink, LogOut, MapPin, Smartphone } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SkipOnErrorToggle } from '~/components/SkipOnErrorToggle';
import { useAuth, useLogout } from '~/hooks/useAuth';
import { useVenueSlug } from '~/hooks/useVenueSlug';

export const ControlHeader = () => {
  const slug = useVenueSlug();
  const { data: user } = useAuth();
  const logout = useLogout();

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b bg-background px-6 py-3">
      <h1 className="font-heading text-xl font-medium">Panel de control</h1>
      <nav className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          render={<a href={`/${slug}`} target="_blank" rel="noreferrer" />}
        >
          <Smartphone data-icon="inline-start" />
          Vista de cliente
        </Button>
        <Button
          variant="outline"
          render={
            <a href={`/${slug}/player`} target="_blank" rel="noreferrer" />
          }
        >
          <ExternalLink data-icon="inline-start" />
          Abrir reproductor
        </Button>
        {user && user.venues.length > 1 && (
          <Button variant="outline" render={<a href="/select" />}>
            <MapPin data-icon="inline-start" />
            Cambiar de venue
          </Button>
        )}
        <span className="text-sm text-muted-foreground">{user?.name}</span>
        <SkipOnErrorToggle />
        <Button variant="ghost" onClick={() => logout.mutate()}>
          <LogOut data-icon="inline-start" />
          Salir
        </Button>
      </nav>
    </header>
  );
};
