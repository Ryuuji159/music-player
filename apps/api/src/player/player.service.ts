import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EventsService } from "../realtime/events.service";
import { QueueService } from "../queue/queue.service";
import { PlaylistService } from "../playlist/playlist.service";
import { notBlockedMediaFilter } from "./playback-errors";

type CommandAction = "play" | "pause" | "stop";

@Injectable()
export class PlayerService {
    constructor(
        private prisma: PrismaService,
        private events: EventsService,
        private queueService: QueueService,
        private playlistService: PlaylistService
    ) { }

    async play() {
        const playing = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { status: "playing" },
        });
        if (playing) {
            await this.emitPlayerCommand("play", playing.id);
            return;
        }

        const paused = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { status: "paused" },
        });
        if (paused) {
            await this.clearPlaying();
            await this.prisma.queueItem.update({
                where: { id: paused.id },
                data: { status: "playing" }
            });
            await this.emitPlayerCommand("play", paused.id);
            await this.emitQueueUpdated();
            return;
        }

        const first = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { media: notBlockedMediaFilter },
            orderBy: { position: "asc" },
        });
        if (!first) {
            await this.playBackup();
            return;
        };

        await this.clearPlaying();
        await this.prisma.queueItem.update({
            where: { id: first.id },
            data: { status: "playing" }
        });
        await this.emitPlayerCommand("play", first.id);
        await this.emitQueueUpdated();
    }

    async playItem(queueItemId: string) {
        const item = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { id: queueItemId },
        });
        if (!item) return;

        await this.clearPlaying();
        await this.prisma.queueItem.update({
            where: { id: item.id },
            data: { status: "playing" },
        });

        await this.emitPlayerCommand("play", item.id);
        await this.emitQueueUpdated();
    }

    async pause() {
        const playing = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { status: "playing" },
        })
        if (!playing) return;

        await this.prisma.queueItem.update({
            where: { id: playing.id },
            data: { status: "paused" },
        });

        await this.emitPlayerCommand("pause", playing.id);
        await this.emitQueueUpdated();
    }

    async next() {
        await this.advance(false);
    }

    async ended() {
        await this.advance(true);
    }

    async error(code: number) {
        const current = await this.prisma.queueItem.findFirst({
            select: { media: { select: { id: true } } },
            where: { status: { in: ["playing", "paused"] } },
        });
        if (!current) return;

        await this.prisma.mediaItem.update({
            where: { id: current.media.id },
            data: { playbackErrorCode: code },
        });

        await this.advance(true);
    }

    async previous() {
        const current = await this.prisma.queueItem.findFirst({
            select: { id: true, position: true },
            where: { status: { in: ["playing", "paused"] } },
        });

        const currentPosition = current ? current.position : Infinity;

        const prevItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { lt: currentPosition }, media: notBlockedMediaFilter },
            orderBy: { position: "desc" },
        });
        if (!prevItem) return;

        await this.clearPlaying();
        await this.prisma.queueItem.update({
            where: { id: prevItem.id },
            data: { status: "playing" },
        });

        await this.emitPlayerCommand("play", prevItem.id);
        await this.emitQueueUpdated();
    }

    private async advance(requirePlaying: boolean) {
        const current = await this.prisma.queueItem.findFirst({
            select: { id: true, position: true },
            where: { status: { in: ["playing", "paused"] } },
        });

        if (requirePlaying && !current) return;

        const currentPosition = current ? current.position : -Infinity;
        const nextItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { gt: currentPosition }, media: notBlockedMediaFilter },
            orderBy: { position: "asc" },
        });

        await this.clearPlaying();

        if (!nextItem) {
            await this.playBackup();
            return;
        }

        await this.prisma.queueItem.update({
            where: { id: nextItem.id },
            data: { status: "playing" }
        });

        await this.emitPlayerCommand("play", nextItem.id);
        await this.emitQueueUpdated();
    }

    private async clearPlaying() {
        await this.prisma.queueItem.updateMany({
            where: { status: { in: ["playing", "paused"] } },
            data: { status: "queued" },
        })
    }

    private async emitPlayerCommand(action: CommandAction, itemId: string | null) {
        let videoId: string | null = null;

        if (itemId) {
            const item = await this.prisma.queueItem.findFirst({
                where: { id: itemId },
                include: { media: { select: { videoId: true } } },
            });
            if (item) videoId = item.media.videoId;
        }

        this.events.emit({
            type: "player.command",
            data: { action, videoId }
        });
    }

    private async emitQueueUpdated() {
        this.events.emit({
            type: "queue.updated",
            data: await this.queueService.current(),
        })
    }

    private async playBackup() {
        const media = await this.playlistService.randomMedia();
        if (!media) {
            await this.emitPlayerCommand("stop", null);
            await this.emitQueueUpdated();
            return;
        }

        const item = await this.queueService.enqueue(media.id);
        await this.clearPlaying()
        await this.prisma.queueItem.update({
            where: { id: item.id },
            data: { status: "playing" },
        });

        await this.emitPlayerCommand("play", item.id);
        await this.emitQueueUpdated();
    }
}