import { Check, Inbox, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import {
  useApproveRequest,
  useRejectRequest,
  useRequests,
} from '~/hooks/useRequests';

export const SongRequests = () => {
  const { data: requests = [] } = useRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="size-4 text-muted-foreground" />
          Solicitudes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {requests.length === 0 ? (
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>Aún no hay solicitudes</EmptyTitle>
              <EmptyDescription>
                Las solicitudes de los clientes aparecerán aquí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center gap-3 py-2">
                <img
                  src={request.media.thumbnailUrl}
                  alt=""
                  className="h-12 w-20 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {request.media.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {request.media.channelTitle}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(request.id)}
                        aria-label="Aprobar"
                      />
                    }
                  >
                    <Check className="text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>Aprobar y añadir a la cola</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(request.id)}
                        aria-label="Rechazar"
                      />
                    }
                  >
                    <X className="text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>Rechazar</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
