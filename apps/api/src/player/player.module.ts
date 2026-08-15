import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { PlayerController } from "./player.controller";
import { PlayerService } from "./player.service";
import { QueueModule } from "../queue/queue.module";

@Module({
    imports: [PrismaModule, RealtimeModule, QueueModule],
    controllers: [PlayerController],
    providers: [PlayerService]
})
export class PlayerModule {}