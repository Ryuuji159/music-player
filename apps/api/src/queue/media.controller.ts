import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';

@Controller('/venues/:slug/media')
@UseGuards(VenueAccessGuard, StaffGuard)
export class MediaController {
  constructor(private media: MediaService) {}

  @Get('/')
  search(@Query('q') q: string | undefined, @Req() req: Request) {
    return this.media.search(q, req.venueId!);
  }
}
