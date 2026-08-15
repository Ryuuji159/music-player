import { Controller, Post } from "@nestjs/common";
import { PlayerService } from "./player.service";

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
    
}