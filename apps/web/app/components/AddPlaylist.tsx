import { useState, type SubmitEventHandler } from 'react';
import { ListPlus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { toast } from '~/components/ui/toast';
import { usePlaylists, useRegisterPlaylist } from '~/hooks/usePlaylists';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { PlaylistRow } from './PlaylistRow';

export const AddPlaylist = () => {
  const slug = useVenueSlug();
  const [url, setUrl] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const playlistsQuery = usePlaylists(slug);
  const registerMutation = useRegisterPlaylist(slug);

  const playlists = playlistsQuery.data ?? [];

  const submit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await registerMutation.mutateAsync(url);
      setUrl('');
      toast.add({ type: 'success', title: 'Playlist registrada' });
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'No se pudo añadir la playlist',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListPlus className="size-4 text-muted-foreground" />
          Agregar playlist
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega una URL de playlist de YouTube"
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Cargando
              </>
            ) : (
              'Añadir'
            )}
          </Button>
        </form>

        {registerMutation.isPending && (
          <p className="text-sm text-muted-foreground">
            Importando canciones de la playlist, puede tardar unos segundos…
          </p>
        )}

        {playlists.length > 0 && (
          <ul className="flex flex-col">
            {playlists.map((playlist) => (
              <PlaylistRow
                key={playlist.id}
                playlist={playlist}
                isExpanded={expandedId === playlist.id}
                onToggle={(open) => setExpandedId(open ? playlist.id : null)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
