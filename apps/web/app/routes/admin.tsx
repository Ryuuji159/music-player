import { useState, type SubmitEventHandler } from 'react';
import type { Route } from './+types/admin';
import { ExternalLink, LogOut, Plus, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { toast } from '~/components/ui/toast';
import { RequireAuth } from '~/components/RequireAuth';
import { useAuth, useLogout } from '~/hooks/useAuth';
import {
  useCreateVenue,
  useRemoveVenue,
  useVenues,
} from '~/hooks/useVenues';
import { useCreateUser, useRemoveUser, useUsers } from '~/hooks/useUsers';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Administración' }];
}

function CreateVenueForm() {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const createVenue = useCreateVenue();

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await createVenue.mutateAsync({ slug, name });
      setSlug('');
      setName('');
      toast.add({ type: 'success', title: 'Venue creada' });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo crear la venue',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="slug (ej. mi-bar)"
        className="min-w-0 flex-1"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        className="min-w-0 flex-1"
      />
      <Button type="submit" disabled={createVenue.isPending}>
        <Plus data-icon="inline-start" />
        Crear
      </Button>
    </form>
  );
}

function CreateUserForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [venueId, setVenueId] = useState('');
  const createUser = useCreateUser();
  const { data: venues = [] } = useVenues();

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        username,
        password,
        role,
        venueId: role === 'user' ? venueId || null : null,
      });
      setUsername('');
      setPassword('');
      toast.add({ type: 'success', title: 'Usuario creado' });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo crear el usuario',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
        className="min-w-0 flex-1"
      />
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Contraseña"
        className="min-w-0 flex-1"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
        className="h-9 rounded-3xl border border-border bg-background px-3 text-sm"
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      {role === 'user' && (
        <select
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="h-9 rounded-3xl border border-border bg-background px-3 text-sm"
        >
          <option value="">Elegir venue…</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" disabled={createUser.isPending}>
        <Plus data-icon="inline-start" />
        Crear
      </Button>
    </form>
  );
}

function AdminView() {
  const { data: user } = useAuth();
  const { data: venues = [] } = useVenues();
  const { data: users = [] } = useUsers();
  const removeVenue = useRemoveVenue();
  const removeUser = useRemoveUser();
  const logout = useLogout();

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          No tienes permisos para acceder a la administración.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-3">
        <h1 className="font-heading text-xl font-medium">Administración</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.username}</span>
          <Button variant="outline" onClick={() => logout.mutate()}>
            <LogOut data-icon="inline-start" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CreateVenueForm />
            <ul className="divide-y divide-border">
              {venues.map((venue) => (
                <li
                  key={venue.id}
                  className="flex items-center gap-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{venue.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /{venue.slug}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a href={`/${venue.slug}/control`} rel="noreferrer" />
                    }
                  >
                    <ExternalLink data-icon="inline-start" />
                    Control
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a
                        href={`/${venue.slug}/player`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    Player
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeVenue.mutate(venue.id)}
                    aria-label="Eliminar venue"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CreateUserForm />
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.username}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.role}
                      {u.venueSlug ? ` · ${u.venueSlug}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeUser.mutate(u.id)}
                    aria-label="Eliminar usuario"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Admin() {
  return (
    <RequireAuth>
      <AdminView />
    </RequireAuth>
  );
}
