import { useState } from 'react';
import type { Route } from './+types/admin.venues';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { VenueDto } from '@skrd/contracts';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { VenueFormDialog } from '~/components/VenueFormDialog';
import { useRemoveVenue, useVenues } from '~/hooks/useVenues';

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Venues' }];
}

export default function AdminVenues() {
  const { data: venues = [] } = useVenues();
  const removeVenue = useRemoveVenue();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<VenueDto | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venues</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            Nueva venue
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {venues.map((venue) => (
            <li key={venue.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{venue.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  /{venue.slug}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<a href={`/${venue.slug}/control`} rel="noreferrer" />}
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
                onClick={() => setEditing(venue)}
                aria-label="Editar venue"
              >
                <Pencil />
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

      {(creating || editing !== null) && (
        <VenueFormDialog
          venue={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}
