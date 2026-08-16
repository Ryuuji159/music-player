import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const userId = req.session?.userId;
    if (!userId) throw new UnauthorizedException('Authentication required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { venue: true },
    });
    if (!user) throw new UnauthorizedException('Authentication required');

    req.user = user;
    return true;
  }
}
