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
import { PlaylistService } from './playlist.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import {
  registerPlaylistSchema,
  type RegisterPlaylistDto,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/venues/:slug/playlist')
@UseGuards(VenueAccessGuard, StaffGuard)
export class PlaylistController {
  constructor(private playlist: PlaylistService) {}

  @Get('/')
  list(@Req() req: Request) {
    return this.playlist.list(req.venueId!);
  }

  @Get('/:id')
  get(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) id: string,
  ) {
    return this.playlist.get(req.venueId!, id);
  }

  @Post('/')
  async register(
    @Req() req: Request,
    @Body(new ZodValidationPipe(registerPlaylistSchema))
    body: RegisterPlaylistDto,
  ) {
    await this.playlist.register(req.venueId!, body.playlistId);
  }

  @Delete('/:id')
  async remove(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) id: string,
  ) {
    await this.playlist.remove(req.venueId!, id);
  }
}
