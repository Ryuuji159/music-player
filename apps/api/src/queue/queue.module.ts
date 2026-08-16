import { Module } from "@nestjs/common";
import { QueueController } from "./queue.controller";
import { QueueService } from "./queue.service";
import { YoutubeModule } from "../youtube/youtube.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
    imports: [PrismaModule, YoutubeModule, RealtimeModule],
    controllers: [QueueController, MediaController],
    providers: [QueueService, MediaService],
    exports: [QueueService, MediaService]
})
export class QueueModule {}