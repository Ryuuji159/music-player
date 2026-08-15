import { Module } from "@nestjs/common";
import { QueueController } from "./queue.controller";
import { QueueService } from "./queue.service";
import { YoutubeModule } from "../youtube/youtube.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MediaService } from "./media.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
    imports: [PrismaModule, YoutubeModule, RealtimeModule],
    controllers: [QueueController],
    providers: [QueueService, MediaService],
    exports: [QueueService]
})
export class QueueModule {}