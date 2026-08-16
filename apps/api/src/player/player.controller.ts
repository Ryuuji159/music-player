import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PlayerService } from './player.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import { playerErrorSchema } from '@skrd/contracts';
import z from 'zod';

@Controller('/venues/:slug/player')
@UseGuards(VenueAccessGuard, StaffGuard)
export class PlayerController {
  constructor(private player: PlayerService) {}

  @Post('/next')
  async next(@Req() req: Request) {
    await this.player.next(req.venueId!);
  }

  @Post('/previous')
  async previous(@Req() req: Request) {
    await this.player.previous(req.venueId!);
  }

  @Post('/play')
  async play(@Req() req: Request) {
    await this.player.play(req.venueId!);
  }

  @Post('/pause')
  async pause(@Req() req: Request) {
    await this.player.pause(req.venueId!);
  }

  @Post('/events/ended')
  async ended(@Req() req: Request) {
    await this.player.ended(req.venueId!);
  }

  @Post('/events/error')
  async error(
    @Req() req: Request,
    @Body(new ZodValidationPipe(playerErrorSchema)) body: { code: number },
  ) {
    await this.player.error(req.venueId!, body.code);
  }

  @Post('/item/:id/play')
  async playItem(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) queueItemId: string,
  ) {
    await this.player.playItem(req.venueId!, queueItemId);
  }
}
