import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { PlayerController } from "./player.controller";
import { PlayerService } from "./player.service";

@Module({
    imports: [PrismaModule, RealtimeModule],
    controllers: [PlayerController],
    providers: [PlayerService]
})
export class PlayerModule {}