import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { QueueService } from './queue.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import {
  type AppendToQueueDto,
  appendToQueueSchema,
  type MoveQueueDto,
  moveQueueSchema,
  type YoutubeId,
  youtubeIdSchema,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/venues/:slug/queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('/')
  @UseGuards(VenueAccessGuard)
  currentQueue(@Req() req: Request) {
    return this.queueService.current(req.venueId!);
  }

  @Post('/append')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async append(
    @Req() req: Request,
    @Body(new ZodValidationPipe(appendToQueueSchema))
    dto: AppendToQueueDto,
  ) {
    await this.queueService.append(req.venueId!, dto);
  }

  @Post('/append/video/:videoId')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async appendByVideoId(
    @Req() req: Request,
    @Param('videoId', new ZodValidationPipe(youtubeIdSchema))
    videoId: YoutubeId,
  ) {
    await this.queueService.append(req.venueId!, { videoId });
  }

  @Post('/item/:id/move')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async move(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) queueItemId: string,
    @Body(new ZodValidationPipe(moveQueueSchema)) dto: MoveQueueDto,
  ) {
    await this.queueService.move(req.venueId!, queueItemId, dto);
  }

  @Delete('/item/:id')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async deleteItem(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) queueItemId: string,
  ) {
    await this.queueService.deleteItem(req.venueId!, queueItemId);
  }

  @Delete('/clear')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async clear(@Req() req: Request) {
    await this.queueService.clear(req.venueId!);
  }

  @Post('/push')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async push(@Req() req: Request) {
    await this.queueService.push(req.venueId!);
  }
}
