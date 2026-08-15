import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

export type RealtimeEvent =
    {
        type: "queue.updated",
        data: object
    } | {
        type: "player.command",
        data: object
    }

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