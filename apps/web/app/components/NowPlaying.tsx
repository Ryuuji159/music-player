import { useQueue } from '~/hooks/useQueue';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import { Card, CardContent } from '~/components/ui/card';

export const NowPlaying = () => {
  const slug = useVenueSlug();
  const { data: queue = [] } = useQueue(slug);
  const current = queue.find(
    (i) => i.status === 'playing' || i.status === 'paused',
  );

  if (!current) return null;

  return (
    <Card size="sm" className="shrink-0">
      <CardContent className="flex items-center gap-3">
        <img
          src={current.media.thumbnailUrl}
          alt=""
          className="h-14 w-24 shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Sonando ahora
          </p>
          <p className="truncate font-semibold">{current.media.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {current.media.channelTitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
