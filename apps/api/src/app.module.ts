import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';
import { YoutubeModule } from './youtube/youtube.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    QueueModule,
    PlayerModule,
    YoutubeModule,
  ],
})
export class AppModule { }
