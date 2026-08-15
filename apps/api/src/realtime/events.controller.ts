import { Controller, Sse, MessageEvent } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { EventsService } from "./events.service";

@Controller("/events")
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Sse()
    events(): Observable<MessageEvent> {
        return this.eventsService.events().pipe(
            map(event => ({
                type: event.type,
                data: event.data,
            })),
        );
    }
}