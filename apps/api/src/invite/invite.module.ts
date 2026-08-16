import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
