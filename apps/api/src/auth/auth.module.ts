import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaSessionStore } from './prisma-session.store';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { StaffGuard } from './guards/staff.guard';
import { RolesGuard } from './guards/roles.guard';
import { VenueAccessGuard } from './guards/venue-access.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaSessionStore,
    SessionAuthGuard,
    StaffGuard,
    RolesGuard,
    VenueAccessGuard,
  ],
  exports: [
    AuthService,
    PrismaSessionStore,
    SessionAuthGuard,
    StaffGuard,
    RolesGuard,
    VenueAccessGuard,
  ],
})
export class AuthModule {}
