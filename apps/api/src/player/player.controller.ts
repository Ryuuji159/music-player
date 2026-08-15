import { Controller, Param, Post } from "@nestjs/common";
import { PlayerService } from "./player.service";
import { ZodValidationPipe } from "../zod-validation.pipe";
import z from "zod";

@Controller('/player')
export class PlayerController {
    constructor(private player: PlayerService) { }

    @Post('/next')
    async next() {
        await this.player.next();
    }

    @Post('/previous')
    async previous() {
        await this.player.previous();
    }

    @Post('/play')
    async play() {
        await this.player.play();
    }

    @Post('/pause')
    async pause() {
        await this.player.pause();
    }
    
    @Post("/events/ended")
    async ended() {
        await this.player.ended();
    }

    @Post("/item/:id/play")
    async playItem(
        @Param("id", new ZodValidationPipe(z.uuid())) queueItemId: string,
    ) {
        await this.player.playItem(queueItemId);
    }

}