import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSongRequestDto, SongRequestListDto } from '@skrd/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../queue/media.service';
import { QueueService } from '../queue/queue.service';
import { EventsService } from '../realtime/events.service';
import { toSongRequestDto } from './requests.mapper';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private queueService: QueueService,
    private events: EventsService,
  ) {}

  async list(venueId: string): Promise<SongRequestListDto> {
    const requests = await this.prisma.songRequest.findMany({
      where: { venueId, status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { media: true },
    });

    return requests.map(toSongRequestDto);
  }

  async create(venueId: string, dto: CreateSongRequestDto) {
    const media = await this.mediaService.resolve(dto.videoId);
    if (!media) return null;

    await this.prisma.songRequest.create({
      data: {
        mediaId: media.id,
        venueId,
        requestedBy: dto.requestedBy,
      },
    });

    await this.emitRequestsUpdated(venueId);
  }

  async approve(venueId: string, id: string) {
    const request = await this.prisma.songRequest.findFirst({
      where: { id, venueId },
      include: { media: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') return;

    await this.prisma.songRequest.update({
      where: { id },
      data: { status: 'approved' },
    });

    await this.queueService.appendMedia(
      venueId,
      request.media.id,
      request.requestedBy,
    );
    await this.emitRequestsUpdated(venueId);
  }

  async reject(venueId: string, id: string) {
    const request = await this.prisma.songRequest.findFirst({
      where: { id, venueId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') return;

    await this.prisma.songRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await this.emitRequestsUpdated(venueId);
  }

  private async emitRequestsUpdated(venueId: string) {
    this.events.emit(venueId, {
      type: 'requests.updated',
      data: await this.list(venueId),
    });
  }
}
