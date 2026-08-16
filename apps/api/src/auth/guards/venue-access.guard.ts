import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VenueAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const slugParam = req.params?.['slug'];
    const slug = typeof slugParam === 'string' ? slugParam : undefined;
    if (!slug) throw new NotFoundException('Venue not found');

    const venue = await this.prisma.venue.findUnique({ where: { slug } });
    if (!venue) throw new NotFoundException('Venue not found');

    const userId = req.session?.userId;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { venues: true },
      });
      if (!user) throw new UnauthorizedException('Authentication required');

      req.user = user;

      if (user.role === 'admin' || user.venues.some((v) => v.id === venue.id)) {
        req.venueId = venue.id;
        return true;
      }

      throw new ForbiddenException('No access to this venue');
    }

    const guestVenueId = req.session?.guestVenueId;
    if (guestVenueId) {
      if (guestVenueId === venue.id) {
        req.venueId = venue.id;
        return true;
      }
      throw new ForbiddenException('Guest session does not match venue');
    }

    throw new UnauthorizedException('Authentication required');
  }
}
