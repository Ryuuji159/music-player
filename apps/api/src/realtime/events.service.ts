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

type Channel = {
  subject: Subject<RealtimeEvent>;
  subscribers: number;
};

@Injectable()
export class EventsService {
  private readonly channels = new Map<string, Channel>();

  private channel(venueId: string): Channel {
    let channel = this.channels.get(venueId);
    if (!channel) {
      channel = { subject: new Subject<RealtimeEvent>(), subscribers: 0 };
      this.channels.set(venueId, channel);
    }
    return channel;
  }

  emit(venueId: string, event: RealtimeEvent) {
    const channel = this.channels.get(venueId);
    if (!channel || channel.subscribers === 0) return;
    channel.subject.next(event);
  }

  events(venueId: string): Observable<RealtimeEvent> {
    return new Observable<RealtimeEvent>((subscriber) => {
      const channel = this.channel(venueId);
      channel.subscribers += 1;

      const subscription = channel.subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        channel.subscribers -= 1;
        if (channel.subscribers <= 0) {
          channel.subject.complete();
          this.channels.delete(venueId);
        }
      };
    });
  }
}
