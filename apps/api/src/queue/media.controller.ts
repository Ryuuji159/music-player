import { Controller, Get, Query } from "@nestjs/common";
import { MediaService } from "./media.service";

@Controller('/media')
export class MediaController {
    constructor(private media: MediaService) { }

    @Get('/')
    search(@Query('q') q?: string) {
        return this.media.search(q);
    }
}
