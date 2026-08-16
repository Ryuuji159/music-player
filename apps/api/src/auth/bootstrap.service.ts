import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from './password';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.prisma.user.count();
    if (count > 0) return;

    const username = this.config.get('ADMIN_USERNAME') ?? 'admin';
    const password = this.config.get('ADMIN_PASSWORD');

    if (!password) {
      this.logger.warn(
        'No ADMIN_PASSWORD set; skipping initial admin user creation.',
      );
      return;
    }

    await this.prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword(password),
        role: 'admin',
      },
    });

    this.logger.log(`Created initial admin user "${username}".`);
  }
}
