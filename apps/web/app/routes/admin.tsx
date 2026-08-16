import type { Route } from './+types/admin';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { Button } from '~/components/ui/button';
import { RequireAuth } from '~/components/RequireAuth';
import { cn } from '~/lib/utils';
import { useAuth, useLogout, userHome } from '~/hooks/useAuth';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Administración' }];
}

const navItems = [
  { to: '/admin/venues', label: 'Venues' },
  { to: '/admin/users', label: 'Usuarios' },
];

function AdminLayout() {
  const { data: user } = useAuth();
  const logout = useLogout();

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            No tienes permisos para acceder a la administración.
          </p>
          {user && user.venues.length > 0 && (
            <Button render={<a href={userHome(user)} />}>Ir a mi venue</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-3">
        <h1 className="font-heading text-xl font-medium">Administración</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="outline" onClick={() => logout.mutate()}>
            <LogOut data-icon="inline-start" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 sm:flex-row">
        <nav className="flex shrink-0 flex-row gap-1 sm:w-48 sm:flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  );
}
