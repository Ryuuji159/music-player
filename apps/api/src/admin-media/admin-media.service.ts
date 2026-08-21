import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminMediaItemDto } from '@skrd/contracts';
import { toAdminMediaDto } from './admin-media.mapper';

@Injectable()
export class AdminMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: string | undefined): Promise<AdminMediaItemDto[]> {
    const query = q?.trim();

    const items = await this.prisma.mediaItem.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { channelTitle: { contains: query, mode: 'insensitive' } },
              { videoId: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        mediaErrors: {
          include: { venue: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { queues: true, requests: true, playlistItems: true },
        },
      },
      orderBy: { title: 'asc' },
      take: 200,
    });

    return items.map(toAdminMediaDto);
  }

  async remove(id: string) {
    const media = await this.prisma.mediaItem.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    await this.prisma.$transaction([
      this.prisma.queueItem.deleteMany({ where: { mediaId: id } }),
      this.prisma.songRequest.deleteMany({ where: { mediaId: id } }),
      this.prisma.mediaItem.delete({ where: { id } }),
    ]);
  }
}
