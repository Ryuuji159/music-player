import { useState } from 'react';
import type { Route } from './+types/admin.users';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { UserDto } from '@skrd/contracts';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { UserFormDialog } from '~/components/UserFormDialog';
import { useRemoveUser, useUsers } from '~/hooks/useUsers';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Usuarios' }];
}

export default function AdminUsers() {
  const { data: users = [] } = useUsers();
  const removeUser = useRemoveUser();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            Nuevo usuario
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{u.name}</p>
                  <Badge variant="secondary">{u.role}</Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {u.email}
                </p>
                {u.venues.length > 0 && (
                  <p className="truncate text-xs text-muted-foreground">
                    {u.venues.map((v) => v.name).join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(u)}
                aria-label="Editar usuario"
              >
                <Pencil />
              </Button>
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

      {(creating || editing !== null) && (
        <UserFormDialog
          user={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}
