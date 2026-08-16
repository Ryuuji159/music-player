import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { hashPassword } from './auth/password';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const prisma = app.get(PrismaService);
    const config = app.get(ConfigService);

    const name = config.get<string>('ADMIN_NAME') ?? 'Admin';
    const email = config.get<string>('ADMIN_EMAIL');
    const password = config.get<string>('ADMIN_PASSWORD');

    if (!email) {
      throw new Error('ADMIN_EMAIL is required to seed the admin user');
    }
    if (!password) {
      throw new Error('ADMIN_PASSWORD is required to seed the admin user');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin user <${email}> already exists; skipping.`);
      return;
    }

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: 'admin',
      },
    });

    console.log(`Created admin user "${name}" <${email}>.`);
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
