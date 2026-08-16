import { useState, type SubmitEventHandler } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { UserDto, UserRole } from '@skrd/contracts';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { useCreateUser, useUpdateUser } from '~/hooks/useUsers';
import { useVenues } from '~/hooks/useVenues';

const roleItems = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Administrador' },
];

export function UserFormDialog({
  user,
  onClose,
}: {
  user?: UserDto;
  onClose: () => void;
}) {
  const isEditing = Boolean(user);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user');
  const [venueIds, setVenueIds] = useState<string[]>(
    user?.venues.map((v) => v.id) ?? [],
  );
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: venues = [] } = useVenues();
  const pending = isEditing ? updateUser.isPending : createUser.isPending;

  const toggleVenue = (id: string, checked: boolean) => {
    setVenueIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id),
    );
  };

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      role,
      venueIds: role === 'admin' ? [] : venueIds,
    };
    try {
      if (isEditing) {
        await updateUser.mutateAsync({
          id: user!.id,
          input: { ...payload, ...(password ? { password } : {}) },
        });
        toast.add({ type: 'success', title: 'Usuario actualizado' });
      } else {
        await createUser.mutateAsync({ ...payload, password });
        toast.add({ type: 'success', title: 'Usuario creado' });
      }
      onClose();
    } catch (err) {
      toast.add({
        type: 'error',
        title: isEditing
          ? 'No se pudo actualizar el usuario'
          : 'No se pudo crear el usuario',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del staff.'
              : 'Da de alta a una persona del staff.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-email">Correo</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-password">
              {isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-role">Rol</Label>
            <Select
              id="user-role"
              items={roleItems}
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {role === 'user' && venues.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Venues</Label>
              <div className="flex flex-col gap-2 rounded-2xl border border-border p-3">
                {venues.map((v) => (
                  <label key={v.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={venueIds.includes(v.id)}
                      onCheckedChange={(checked) =>
                        toggleVenue(v.id, Boolean(checked))
                      }
                    />
                    <span className="truncate">{v.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : isEditing ? (
                <Pencil data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
