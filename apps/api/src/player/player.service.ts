import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EventsService } from "../realtime/events.service";

@Injectable()
export class PlayerService {
    constructor(private prisma: PrismaService, private events: EventsService) { }

    async next() {
        const currentPlaying = await this.prisma.queueItem.findFirst({
            select: { id: true, position: true },
            where: { status: 'playing' }
        });

        const currentPosition = currentPlaying ? currentPlaying.position : -Infinity;

        const nextItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { gt: currentPosition } },
            orderBy: { position: 'asc' }
        });

        if (!nextItem) return;

        if (currentPlaying) {
            await this.prisma.queueItem.update({
                where: { id: currentPlaying.id },
                data: { status: 'ended' }
            });
        }

        await this.prisma.queueItem.update({
            where: { id: nextItem.id },
            data: { status: 'playing' }
        });


        await this.emitPlayerCommand("play", nextItem.id);
    }

    async previous() {
        const currentPlaying = await this.prisma.queueItem.findFirst({
            select: { id: true, position: true },
            where: { status: 'playing' }
        });

        const currentPosition = currentPlaying ? currentPlaying.position : Infinity;

        const prevItem = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { position: { lt: currentPosition } },
            orderBy: { position: 'desc' }
        });

        if (!prevItem) return;

        if (currentPlaying) {
            await this.prisma.queueItem.update({
                where: { id: currentPlaying.id },
                data: { status: 'queued' }
            });
        }

        await this.prisma.queueItem.update({
            where: { id: prevItem.id },
            data: { status: 'playing' }
        });


        await this.emitPlayerCommand("play", prevItem.id);
    }

    async play() {
        const currentPaused = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { status: 'paused' }
        });

        let itemToPlay = currentPaused?.id;
        if (!currentPaused) {
            const firstItem = await this.prisma.queueItem.findFirst({
                select: { id: true },
                where: { position: { gt: -Infinity } },
                orderBy: { position: 'asc' }
            });

            itemToPlay = firstItem?.id;
        }

        if (!itemToPlay) return;

        await this.prisma.queueItem.update({
            where: { id: itemToPlay },
            data: { status: 'playing' }
        })

        await this.emitPlayerCommand("play", itemToPlay);
    }

    async pause() {
        const currentPlaying = await this.prisma.queueItem.findFirst({
            select: { id: true },
            where: { status: 'playing' }
        });

        if (!currentPlaying) return;

        await this.prisma.queueItem.update({
            where: { id: currentPlaying.id },
            data: { status: 'paused' }
        })

        await this.emitPlayerCommand("pause", currentPlaying.id);
    }

    private async emitPlayerCommand(action: string, itemId: string) {
        const queueItem = await this.prisma.queueItem.findFirst({
            where: { id: itemId },
            include: { media: { select: { videoId: true } } }
        })

        if (!queueItem) return;

        this.events.emit({
            type: "player.command",
            data: { action: action, videoId: queueItem.media.videoId }
        })
    }
}