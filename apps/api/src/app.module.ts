import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';
import { YoutubeModule } from './youtube/youtube.module';
import { PlayerModule } from './player/player.module';
import { PlaylistModule } from './playlist/playlist.module';
import { RequestsModule } from './requests/requests.module';
import { AuthModule } from './auth/auth.module';
import { VenuesModule } from './venues/venues.module';
import { UsersModule } from './users/users.module';
import { InviteModule } from './invite/invite.module';
import { SettingsModule } from './settings/settings.module';
import { AdminMediaModule } from './admin-media/admin-media.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    QueueModule,
    PlayerModule,
    YoutubeModule,
    PlaylistModule,
    RequestsModule,
    AuthModule,
    VenuesModule,
    UsersModule,
    InviteModule,
    SettingsModule,
    AdminMediaModule,
  ],
})
export class AppModule {}
