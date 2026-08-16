import { useState, type SubmitEventHandler } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { slugify, type VenueDto } from '@skrd/contracts';
import { Button } from '~/components/ui/button';
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
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { useCreateVenue, useUpdateVenue } from '~/hooks/useVenues';

export function VenueFormDialog({
  venue,
  onClose,
}: {
  venue?: VenueDto;
  onClose: () => void;
}) {
  const isEditing = Boolean(venue);
  const [name, setName] = useState(venue?.name ?? '');
  const [slug, setSlug] = useState(venue?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const pending = isEditing ? updateVenue.isPending : createVenue.isPending;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateVenue.mutateAsync({
          id: venue!.id,
          input: { name, slug: slug.trim() || undefined },
        });
        toast.add({ type: 'success', title: 'Venue actualizada' });
      } else {
        await createVenue.mutateAsync({ name, slug: slug.trim() || undefined });
        toast.add({ type: 'success', title: 'Venue creada' });
      }
      onClose();
    } catch (err) {
      toast.add({
        type: 'error',
        title: isEditing
          ? 'No se pudo actualizar la venue'
          : 'No se pudo crear la venue',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar venue' : 'Nueva venue'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del bar.'
              : 'Registra un nuevo bar.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="venue-name">Nombre</Label>
            <Input
              id="venue-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Mi bar"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="venue-slug">Slug</Label>
            <Input
              id="venue-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="mi-bar"
              autoComplete="off"
            />
          </div>
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
