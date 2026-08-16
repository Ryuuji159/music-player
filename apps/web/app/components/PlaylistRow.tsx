import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import type { PlaylistDto } from '@skrd/contracts';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { toast } from '~/components/ui/toast';
import { useRemovePlaylist } from '~/hooks/usePlaylists';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { PlaylistItems } from './PlaylistItems';

type Props = {
  playlist: PlaylistDto;
  isExpanded: boolean;
  onToggle: (open: boolean) => void;
};

export const PlaylistRow = ({ playlist, isExpanded, onToggle }: Props) => {
  const slug = useVenueSlug();
  const removeMutation = useRemovePlaylist(slug);

  const remove = async () => {
    try {
      await removeMutation.mutateAsync(playlist.id);
      if (isExpanded) onToggle(false);
      toast.add({ type: 'success', title: 'Playlist eliminada' });
    } catch {
      toast.add({ type: 'error', title: 'No se pudo eliminar la playlist' });
    }
  };

  return (
    <li>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="flex items-center mb-2">
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                className="h-auto flex-1 justify-start gap-3 px-2 py-2 text-left"
              />
            }
          >
            {playlist.thumbnailUrl && (
              <img
                src={playlist.thumbnailUrl}
                alt=""
                className="h-9 w-12 shrink-0 object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {playlist.title}
              </span>
              <Badge variant="secondary" className="mt-1">
                {playlist.itemCount} canciones
              </Badge>
            </span>
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </CollapsibleTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Acciones de la playlist"
                />
              }
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                <ExternalLink />
                Abrir en YouTube
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={remove}>
                <Trash2 />
                Eliminar playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent>
          <PlaylistItems playlistId={playlist.id} />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};
