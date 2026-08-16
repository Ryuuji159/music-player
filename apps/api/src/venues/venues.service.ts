import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '@skrd/contracts';
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
    const slug = await this.uniqueSlug(dto.slug?.trim() || slugify(dto.name));
    const venue = await this.prisma.venue.create({
      data: { slug, name: dto.name },
    });
    return { id: venue.id, slug: venue.slug, name: venue.name };
  }

  async update(id: string, dto: CreateVenueDto): Promise<VenueDto> {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');

    const requestedSlug = dto.slug?.trim();
    const slug =
      requestedSlug && requestedSlug !== venue.slug
        ? await this.uniqueSlug(requestedSlug, id)
        : venue.slug;

    const updated = await this.prisma.venue.update({
      where: { id },
      data: { name: dto.name, slug },
    });
    return { id: updated.id, slug: updated.slug, name: updated.name };
  }

  async remove(id: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    await this.prisma.venue.delete({ where: { id } });
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let suffix = 2;
    while (
      await this.prisma.venue.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      })
    ) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }
}
