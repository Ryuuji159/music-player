import { Injectable } from "@nestjs/common";
import { AppendToQueueDto, MoveQueueDto, QueueItemDto } from "@skrd/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { MediaService } from "./media.service";
import { EventsService } from "../realtime/events.service";
import { toQueueItemDto } from "./queue.mapper";
import { notBlockedMediaFilter } from "../player/playback-errors";

@Injectable()
export class QueueService {
    constructor(
        private prisma: PrismaService,
        private mediaService: MediaService,
        private events: EventsService
    ) { }

    async current(): Promise<QueueItemDto[]> {
        const items = await this.prisma.queueItem.findMany({
            orderBy: { position: 'asc' },
            where: { media: notBlockedMediaFilter },
            include: { media: true }
        });

        return items.map(toQueueItemDto);
    }

    async append(appendToQueueDTO: AppendToQueueDto) {
        const { videoId } = appendToQueueDTO;

        const media = await this.mediaService.resolve(videoId);
        if (!media) return null;

        await this.enqueue(media.id);
        await this.emitQueueUpdated();
    }

    async move(queueItemId: string, moveQueueDTO: MoveQueueDto) {
        const { siblingId, placement } = moveQueueDTO;

        if (queueItemId === siblingId) {
            return await this.prisma.queueItem.findUnique({
                where: { id: queueItemId },
            });
        }

        const sibling = await this.prisma.queueItem.findFirst({
            select: { position: true },
            where: { id: siblingId }
        })

        if (!sibling) {
            return null;
        }

        const position = await this.getMovePosition(queueItemId, sibling.position, placement);

        await this.prisma.queueItem.update({
            where: { id: queueItemId },
            data: { position: position },
            include: { media: true }
        });

        await this.emitQueueUpdated();
    }

    async deleteItem(queueItemId: string) {
        await this.prisma.queueItem.delete({ where: { id: queueItemId } });
        await this.emitQueueUpdated();
    }

    async clear() {
        await this.prisma.queueItem.deleteMany();
        await this.emitQueueUpdated();
    }

    async push() {
        await this.emitQueueUpdated();
    }

    async enqueue(mediaId: string) {
        const last = await this.prisma.queueItem.findFirst({
            select: { position: true },
            orderBy: { position: "desc" },
        });

        return this.prisma.queueItem.create({
            data: {
                position: last ? last.position + 1000 : 1000,
                mediaId,
            }
        });
    }

    private async getMovePosition(queueItemId: string, siblingPosition: number, placement: "before" | "after") {
        if (placement === "before") {
            const prev = await this.prisma.queueItem.findFirst({
                select: { position: true },
                where: {
                    id: { not: queueItemId },
                    position: { lt: siblingPosition }
                },
                orderBy: { position: "desc" }
            });


            return prev ? this.midpoint(prev.position, siblingPosition) : siblingPosition - 1000;
        }


        const next = await this.prisma.queueItem.findFirst({
            select: { position: true },
            where: {
                id: { not: queueItemId },
                position: { gt: siblingPosition }
            },
            orderBy: { position: "asc" }
        });

        return next ? this.midpoint(siblingPosition, next.position) : siblingPosition + 1000;
    }

    private async emitQueueUpdated() {
        this.events.emit({
            type: "queue.updated",
            data: await this.current()
        })
    }

    private midpoint(a: number, b: number) {
        return a + (b - a) / 2;
    }
}