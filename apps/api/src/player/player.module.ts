import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { PlayerController } from "./player.controller";
import { PlayerService } from "./player.service";
import { QueueModule } from "../queue/queue.module";
import { PlaylistModule } from "../playlist/playlist.module";

@Module({
    imports: [PrismaModule, RealtimeModule, QueueModule, PlaylistModule],
    controllers: [PlayerController],
    providers: [PlayerService]
})
export class PlayerModule { }