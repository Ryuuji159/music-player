import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateVenueDto, VenueDto } from '@skrd/contracts';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<VenueDto[]> {
    const venues = await this.prisma.venue.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return venues.map((v) => ({ id: v.id, slug: v.slug, name: v.name }));
  }

  async create(dto: CreateVenueDto): Promise<VenueDto> {
    const venue = await this.prisma.venue.create({
      data: { slug: dto.slug, name: dto.name },
    });
    return { id: venue.id, slug: venue.slug, name: venue.name };
  }

  async remove(id: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    await this.prisma.venue.delete({ where: { id } });
  }
}
