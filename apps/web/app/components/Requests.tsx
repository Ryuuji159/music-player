import { Inbox } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { useRequests } from '~/hooks/useRequests';

export const Requests = () => {
  const { data: requests = [] } = useRequests();

  if (requests.length === 0) {
    return (
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>Aún no has solicitado canciones</EmptyTitle>
          <EmptyDescription>
            Tus solicitudes aparecerán aquí a la espera de aprobación.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {requests.map((request) => (
        <li key={request.id} className="flex items-center gap-3 px-3 py-2">
          <img
            src={request.media.thumbnailUrl}
            alt=""
            className="h-14 w-24 shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-medium">
                {request.media.title}
              </p>
              <Badge variant="secondary" className="shrink-0">
                Pendiente de aprobación
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {request.media.channelTitle}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};
