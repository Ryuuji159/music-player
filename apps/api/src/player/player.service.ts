import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EventsService } from "../realtime/events.service";
import { QueueService } from "../queue/queue.service";

type CommandAction = "play" | "pause" | "stop";

@Injectable()
export class PlayerService {
    constructor(
        private prisma: PrismaService,
        private events: EventsService,
        private queueService: QueueService,
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
            orderBy: { position: "asc" },
        });
        if (!first) return;

        await this.clearPlaying();
        await this.prisma.queueItem.update({
            where: { id: first.id },
            data: { status: "playing" }
        });
        await this.emitPlayerCommand("play", first.id);
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

    async previous() {
        const current = await this.prisma.queueItem.findFirst({
            select: { id: true, position: true },
            where: { status: "playing" },
        });

        const currentPosition = current ? current.position : Infinity;

        const prevItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { lt: currentPosition } },
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
            where: { status: "playing" }
        });

        if (requirePlaying && !current) return;

        const currentPosition = current ? current.position : -Infinity;
        const nextItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { gt: currentPosition } },
            orderBy: { position: "asc" },
        });

        await this.clearPlaying();

        if (!nextItem) {
            await this.emitPlayerCommand("stop", null);
            await this.emitQueueUpdated();
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
            where: { status: "playing" },
            data: { status: "queued" },
        })
    }

    private async emitPlayerCommand(action: CommandAction, itemId: string | null) {
        let videoId: string | null = null;

        if(itemId) {
            const item = await this.prisma.queueItem.findFirst({
                where: {id: itemId},
                include: {media: {select: {videoId: true}}},
            });
            if(item) videoId = item.media.videoId;
        }

        this.events.emit({
            type: "player.command",
            data: {action, videoId}
        });
    }

    private async emitQueueUpdated() {
        this.events.emit({
            type: "queue.updated",
            data: await this.queueService.current(),
        })
    }
}