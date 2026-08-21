import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { VenueSettingsDto } from '@skrd/contracts';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(venueId: string): Promise<VenueSettingsDto> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { skipOnError: true },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return { skipOnError: venue.skipOnError };
  }

  async update(venueId: string, skipOnError: boolean): Promise<VenueSettingsDto> {
    const venue = await this.prisma.venue.update({
      where: { id: venueId },
      data: { skipOnError },
      select: { skipOnError: true },
    });
    return { skipOnError: venue.skipOnError };
  }
}
