import { Injectable } from '@nestjs/common';
import type {
  PlayerCommandDto,
  QueueDto,
  SongRequestListDto,
} from '@skrd/contracts';
import { Observable, Subject } from 'rxjs';

export type RealtimeEvent =
  | {
      type: 'queue.updated';
      data: QueueDto;
    }
  | {
      type: 'player.command';
      data: PlayerCommandDto;
    }
  | {
      type: 'requests.updated';
      data: SongRequestListDto;
    };

@Injectable()
export class EventsService {
  private readonly events$ = new Subject<RealtimeEvent>();

  emit(event: RealtimeEvent) {
    this.events$.next(event);
  }

  events(): Observable<RealtimeEvent> {
    return this.events$.asObservable();
  }
}
