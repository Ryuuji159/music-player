import { Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';

export const SongRequests = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="size-4 text-muted-foreground" />
          Solicitudes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Empty className="p-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Aún no hay solicitudes</EmptyTitle>
            <EmptyDescription>
              Las solicitudes aparecerán aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
};
