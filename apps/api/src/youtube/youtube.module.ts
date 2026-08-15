import { Module } from "@nestjs/common";
import { YoutubeService } from "./youtube.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [YoutubeService],
    exports: [YoutubeService],
})
export class YoutubeModule {}