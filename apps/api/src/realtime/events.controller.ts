import {
  Controller,
  MessageEvent,
  NotFoundException,
  Param,
  Sse,
} from '@nestjs/common';
import { from, map, switchMap, throwError, Observable } from 'rxjs';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse('/:slug')
  events(@Param('slug') slug: string): Observable<MessageEvent> {
    return from(this.prisma.venue.findUnique({ where: { slug } })).pipe(
      switchMap((venue) => {
        if (!venue) {
          return throwError(() => new NotFoundException('Venue not found'));
        }
        return this.eventsService.events(venue.id).pipe(
          map((event) => ({
            type: event.type,
            data: event.data,
          })),
        );
      }),
    );
  }
}
