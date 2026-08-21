import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../realtime/events.service';
import { QueueService } from '../queue/queue.service';
import { PlaylistService } from '../playlist/playlist.service';
import { notBlockedMediaFilter } from './playback-errors';

type CommandAction = 'play' | 'pause' | 'stop';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private queueService: QueueService,
    private playlistService: PlaylistService,
  ) {}

  async play(venueId: string) {
    const playing = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: { venueId, status: 'playing' },
    });
    if (playing) {
      await this.emitPlayerCommand(venueId, 'play', playing.id);
      return;
    }

    const paused = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: { venueId, status: 'paused' },
    });
    if (paused) {
      await this.clearPlaying(venueId);
      await this.prisma.queueItem.update({
        where: { id: paused.id },
        data: { status: 'playing' },
      });
      await this.emitPlayerCommand(venueId, 'play', paused.id);
      await this.emitQueueUpdated(venueId);
      return;
    }

    const first = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: { venueId, media: notBlockedMediaFilter(venueId) },
      orderBy: { position: 'asc' },
    });
    if (!first) {
      await this.playBackup(venueId);
      return;
    }

    await this.clearPlaying(venueId);
    await this.prisma.queueItem.update({
      where: { id: first.id },
      data: { status: 'playing' },
    });
    await this.emitPlayerCommand(venueId, 'play', first.id);
    await this.emitQueueUpdated(venueId);
  }

  async playItem(venueId: string, queueItemId: string) {
    const item = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: { id: queueItemId, venueId },
    });
    if (!item) return;

    await this.clearPlaying(venueId);
    await this.prisma.queueItem.update({
      where: { id: item.id },
      data: { status: 'playing' },
    });

    await this.emitPlayerCommand(venueId, 'play', item.id);
    await this.emitQueueUpdated(venueId);
  }

  async pause(venueId: string) {
    const playing = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: { venueId, status: 'playing' },
    });
    if (!playing) return;

    await this.prisma.queueItem.update({
      where: { id: playing.id },
      data: { status: 'paused' },
    });

    await this.emitPlayerCommand(venueId, 'pause', playing.id);
    await this.emitQueueUpdated(venueId);
  }

  async next(venueId: string) {
    await this.advance(venueId, false);
  }

  async ended(venueId: string) {
    await this.advance(venueId, true);
  }

  async error(venueId: string, code: number) {
    const current = await this.prisma.queueItem.findFirst({
      select: { mediaId: true, media: { select: { videoId: true, title: true } } },
      where: { venueId, status: { in: ['playing', 'paused'] } },
    });
    if (!current) return;

    this.logger.error(
      `Player error code=${code} venueId=${venueId} mediaId=${current.mediaId} videoId=${current.media.videoId} title="${current.media.title}"`,
    );

    await this.prisma.venueMediaError.upsert({
      where: {
        venueId_mediaId: { venueId, mediaId: current.mediaId },
      },
      create: { venueId, mediaId: current.mediaId, errorCode: code },
      update: { errorCode: code },
    });

    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { skipOnError: true },
    });
    if (venue && !venue.skipOnError) {
      this.logger.warn(
        `Skip-on-error disabled for venueId=${venueId}; staying on current item`,
      );
      return;
    }

    await this.advance(venueId, true);
  }

  async previous(venueId: string) {
    const current = await this.prisma.queueItem.findFirst({
      select: { id: true, position: true },
      where: { venueId, status: { in: ['playing', 'paused'] } },
    });

    const currentPosition = current ? current.position : Infinity;

    const prevItem = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: {
        venueId,
        position: { lt: currentPosition },
        media: notBlockedMediaFilter(venueId),
      },
      orderBy: { position: 'desc' },
    });
    if (!prevItem) return;

    await this.clearPlaying(venueId);
    await this.prisma.queueItem.update({
      where: { id: prevItem.id },
      data: { status: 'playing' },
    });

    await this.emitPlayerCommand(venueId, 'play', prevItem.id);
    await this.emitQueueUpdated(venueId);
  }

  private async advance(venueId: string, requirePlaying: boolean) {
    const current = await this.prisma.queueItem.findFirst({
      select: { id: true, position: true },
      where: { venueId, status: { in: ['playing', 'paused'] } },
    });

    if (requirePlaying && !current) return;

    const currentPosition = current ? current.position : -Infinity;
    const nextItem = await this.prisma.queueItem.findFirst({
      select: { id: true },
      where: {
        venueId,
        position: { gt: currentPosition },
        media: notBlockedMediaFilter(venueId),
      },
      orderBy: { position: 'asc' },
    });

    await this.clearPlaying(venueId);

    if (!nextItem) {
      await this.playBackup(venueId);
      return;
    }

    await this.prisma.queueItem.update({
      where: { id: nextItem.id },
      data: { status: 'playing' },
    });

    await this.emitPlayerCommand(venueId, 'play', nextItem.id);
    await this.emitQueueUpdated(venueId);
  }

  private async clearPlaying(venueId: string) {
    await this.prisma.queueItem.updateMany({
      where: { venueId, status: { in: ['playing', 'paused'] } },
      data: { status: 'queued' },
    });
  }

  private async emitPlayerCommand(
    venueId: string,
    action: CommandAction,
    itemId: string | null,
  ) {
    let videoId: string | null = null;

    if (itemId) {
      const item = await this.prisma.queueItem.findFirst({
        where: { id: itemId, venueId },
        include: { media: { select: { videoId: true } } },
      });
      if (item) videoId = item.media.videoId;
    }

    this.events.emit(venueId, {
      type: 'player.command',
      data: { action, videoId },
    });
  }

  private async emitQueueUpdated(venueId: string) {
    this.events.emit(venueId, {
      type: 'queue.updated',
      data: await this.queueService.current(venueId),
    });
  }

  private async playBackup(venueId: string) {
    let media = await this.playlistService.randomMedia(venueId);

    for (let attempt = 0; media && attempt < 3; attempt += 1) {
      const queued = await this.prisma.queueItem.findFirst({
        select: { id: true },
        where: { venueId, mediaId: media.id },
      });

      if (!queued || attempt === 2) break;

      media = await this.playlistService.randomMedia(venueId);
    }

    if (!media) {
      await this.emitPlayerCommand(venueId, 'stop', null);
      await this.emitQueueUpdated(venueId);
      return;
    }

    const item = await this.queueService.enqueue(venueId, media.id);
    await this.clearPlaying(venueId);
    await this.prisma.queueItem.update({
      where: { id: item.id },
      data: { status: 'playing' },
    });

    await this.emitPlayerCommand(venueId, 'play', item.id);
    await this.emitQueueUpdated(venueId);
  }
}
