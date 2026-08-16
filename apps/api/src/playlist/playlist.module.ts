import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { YoutubeModule } from '../youtube/youtube.module';
import { QueueModule } from '../queue/queue.module';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';

@Module({
  imports: [PrismaModule, YoutubeModule, QueueModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
