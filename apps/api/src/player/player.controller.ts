import { Controller, Param, Post, Body } from "@nestjs/common";
import { PlayerService } from "./player.service";
import { ZodValidationPipe } from "../zod-validation.pipe";
import { playerErrorSchema } from "@skrd/contracts";
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

    @Post("/events/error")
    async error(
        @Body(new ZodValidationPipe(playerErrorSchema)) body: { code: number },
    ) {
        await this.player.error(body.code);
    }

    @Post("/item/:id/play")
    async playItem(
        @Param("id", new ZodValidationPipe(z.uuid())) queueItemId: string,
    ) {
        await this.player.playItem(queueItemId);
    }

}