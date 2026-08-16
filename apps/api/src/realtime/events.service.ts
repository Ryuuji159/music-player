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
  private readonly channels = new Map<string, Subject<RealtimeEvent>>();

  private channel(venueId: string): Subject<RealtimeEvent> {
    let subject = this.channels.get(venueId);
    if (!subject) {
      subject = new Subject<RealtimeEvent>();
      this.channels.set(venueId, subject);
    }
    return subject;
  }

  emit(venueId: string, event: RealtimeEvent) {
    this.channel(venueId).next(event);
  }

  events(venueId: string): Observable<RealtimeEvent> {
    return this.channel(venueId).asObservable();
  }
}
