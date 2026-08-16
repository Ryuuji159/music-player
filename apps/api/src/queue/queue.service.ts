import { Injectable } from '@nestjs/common';
import { AppendToQueueDto, MoveQueueDto, QueueItemDto } from '@skrd/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from './media.service';
import { EventsService } from '../realtime/events.service';
import { toQueueItemDto } from './queue.mapper';
import { notBlockedMediaFilter } from '../player/playback-errors';

@Injectable()
export class QueueService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private events: EventsService,
  ) {}

  async current(venueId: string): Promise<QueueItemDto[]> {
    const items = await this.prisma.queueItem.findMany({
      orderBy: { position: 'asc' },
      where: { venueId, media: notBlockedMediaFilter(venueId) },
      include: { media: true },
    });

    return items.map(toQueueItemDto);
  }

  async append(venueId: string, dto: AppendToQueueDto) {
    const media = await this.mediaService.resolve(dto.videoId);
    if (!media) return null;

    await this.enqueue(venueId, media.id);
    await this.emitQueueUpdated(venueId);
  }

  async appendMedia(venueId: string, mediaId: string, requestedBy?: string | null) {
    await this.enqueue(venueId, mediaId, requestedBy);
    await this.emitQueueUpdated(venueId);
  }

  async move(venueId: string, queueItemId: string, dto: MoveQueueDto) {
    const { siblingId, placement } = dto;

    if (queueItemId === siblingId) {
      return await this.prisma.queueItem.findFirst({
        where: { id: queueItemId, venueId },
      });
    }

    const sibling = await this.prisma.queueItem.findFirst({
      select: { position: true },
      where: { id: siblingId, venueId },
    });

    if (!sibling) {
      return null;
    }

    const position = await this.getMovePosition(
      venueId,
      queueItemId,
      sibling.position,
      placement,
    );

    await this.prisma.queueItem.updateMany({
      where: { id: queueItemId, venueId },
      data: { position },
    });

    await this.emitQueueUpdated(venueId);
  }

  async deleteItem(venueId: string, queueItemId: string) {
    await this.prisma.queueItem.deleteMany({
      where: { id: queueItemId, venueId },
    });
    await this.emitQueueUpdated(venueId);
  }

  async clear(venueId: string) {
    await this.prisma.queueItem.deleteMany({ where: { venueId } });
    await this.emitQueueUpdated(venueId);
  }

  async push(venueId: string) {
    await this.emitQueueUpdated(venueId);
  }

  async enqueue(venueId: string, mediaId: string, requestedBy?: string | null) {
    const last = await this.prisma.queueItem.findFirst({
      select: { position: true },
      where: { venueId },
      orderBy: { position: 'desc' },
    });

    return this.prisma.queueItem.create({
      data: {
        position: last ? last.position + 1000 : 1000,
        mediaId,
        venueId,
        requestedBy: requestedBy ?? null,
      },
    });
  }

  private async getMovePosition(
    venueId: string,
    queueItemId: string,
    siblingPosition: number,
    placement: 'before' | 'after',
  ) {
    if (placement === 'before') {
      const prev = await this.prisma.queueItem.findFirst({
        select: { position: true },
        where: {
          venueId,
          id: { not: queueItemId },
          position: { lt: siblingPosition },
        },
        orderBy: { position: 'desc' },
      });

      return prev
        ? this.midpoint(prev.position, siblingPosition)
        : siblingPosition - 1000;
    }

    const next = await this.prisma.queueItem.findFirst({
      select: { position: true },
      where: {
        venueId,
        id: { not: queueItemId },
        position: { gt: siblingPosition },
      },
      orderBy: { position: 'asc' },
    });

    return next
      ? this.midpoint(siblingPosition, next.position)
      : siblingPosition + 1000;
  }

  private async emitQueueUpdated(venueId: string) {
    this.events.emit(venueId, {
      type: 'queue.updated',
      data: await this.current(venueId),
    });
  }

  private midpoint(a: number, b: number) {
    return a + (b - a) / 2;
  }
}
