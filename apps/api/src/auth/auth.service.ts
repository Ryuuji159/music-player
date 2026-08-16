import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { verifyPassword } from './password';
import { toUserDto } from './user.mapper';
import type { AuthUser } from './auth.types';
import type { UserDto } from '@skrd/contracts';

const DEFAULT_STAFF_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  readonly staffMaxAgeMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.staffMaxAgeMs = Number(
      config.get('SESSION_MAX_AGE_MS') ?? DEFAULT_STAFF_MAX_AGE_MS,
    );
  }

  async validate(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { venues: true },
    });
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    return user;
  }

  toUserDto(user: AuthUser): UserDto {
    return toUserDto(user);
  }
}
