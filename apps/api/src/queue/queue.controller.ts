import { Body, Controller, Delete, Get, Param, Post, UsePipes } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { ZodValidationPipe } from "../zod-validation.pipe";
import { type AppendToQueueDto, appendToQueueSchema, type MoveQueueDto, moveQueueSchema } from "@skrd/contracts";
import z from "zod";

@Controller('/queue')
export class QueueController {
    constructor(private queueService: QueueService) { }

    @Get('/')
    currentQueue() {
        return this.queueService.current()
    }

    @Post('/append')
    async append(
        @Body(new ZodValidationPipe(appendToQueueSchema)) appendToQueueDTO: AppendToQueueDto
    ) {
        await this.queueService.append(appendToQueueDTO);
    }

    @Post('/item/:id/move')
    async move(
        @Param("id", new ZodValidationPipe(z.uuid())) queueItemId: string,
        @Body(new ZodValidationPipe(moveQueueSchema)) moveQueueDto: MoveQueueDto
    ) {
        await this.queueService.move(queueItemId, moveQueueDto);
    }

    @Delete('/item/:id')
    async deleteItem(
        @Param("id", new ZodValidationPipe(z.uuid())) queueItemId: string,
    ) {
        await this.queueService.deleteItem(queueItemId);
    }

    @Delete('/clear')
    async clear() {
        await this.queueService.clear();
    }

    @Post('/push')
    async push() {
        await this.queueService.push();
    }
}