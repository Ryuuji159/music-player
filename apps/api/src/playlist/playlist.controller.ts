import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { ZodValidationPipe } from "../zod-validation.pipe";
import { registerPlaylistSchema, type RegisterPlaylistDto } from "@skrd/contracts";
import z from "zod";

@Controller("/playlist")
export class PlaylistController {
    constructor(private playlist: PlaylistService) { }

    @Get("/")
    list() {
        return this.playlist.list();
    }

    @Get("/:id")
    get(@Param("id", new ZodValidationPipe(z.uuid())) id: string) {
        return this.playlist.get(id);
    }

    @Post("/")
    async register(@Body(new ZodValidationPipe(registerPlaylistSchema)) body: RegisterPlaylistDto) {
        await this.playlist.register(body.playlistId);
    }

    @Delete("/:id")
    async remove(@Param("id", new ZodValidationPipe(z.uuid())) id: string) {
        await this.playlist.remove(id);
    }
}
