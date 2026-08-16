import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/select';
import { LogOut, MapPin } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '~/components/ui/empty';
import { Spinner } from '~/components/ui/spinner';
import { LoginForm } from '~/components/LoginForm';
import { useAuth, useLogout } from '~/hooks/useAuth';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Elegir venue' }];
}

export default function Select() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-3">
        <h1 className="font-heading text-xl font-medium">Elegir venue</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <Button variant="outline" onClick={() => logout.mutate()}>
            <LogOut data-icon="inline-start" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
        {user.venues.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Sin venues asignadas</EmptyTitle>
              <EmptyDescription>
                Pide a un administrador que te asigne una venue.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          user.venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  /{venue.slug}
                </span>
                <Button render={<a href={`/${venue.slug}/control`} />}>
                  <MapPin data-icon="inline-start" />
                  Entrar
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
