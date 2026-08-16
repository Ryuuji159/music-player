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

  async list(): Promise<SongRequestListDto> {
    const requests = await this.prisma.songRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { media: true },
    });

    return requests.map(toSongRequestDto);
  }

  async create(dto: CreateSongRequestDto) {
    const media = await this.mediaService.resolve(dto.videoId);
    if (!media) return null;

    await this.prisma.songRequest.create({
      data: { mediaId: media.id },
    });

    await this.emitRequestsUpdated();
  }

  async approve(id: string) {
    const request = await this.prisma.songRequest.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') return;

    await this.prisma.songRequest.update({
      where: { id },
      data: { status: 'approved' },
    });

    await this.queueService.appendMedia(request.media.id);
    await this.emitRequestsUpdated();
  }

  async reject(id: string) {
    const request = await this.prisma.songRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') return;

    await this.prisma.songRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await this.emitRequestsUpdated();
  }

  private async emitRequestsUpdated() {
    this.events.emit({
      type: 'requests.updated',
      data: await this.list(),
    });
  }
}
