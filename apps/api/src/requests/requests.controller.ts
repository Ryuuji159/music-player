import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { RequestsService } from './requests.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import {
  createSongRequestSchema,
  type CreateSongRequestDto,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/venues/:slug/requests')
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Get('/')
  @UseGuards(VenueAccessGuard)
  list(@Req() req: Request) {
    return this.requests.list(req.venueId!);
  }

  @Post('/')
  @UseGuards(VenueAccessGuard)
  async create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(createSongRequestSchema))
    dto: CreateSongRequestDto,
  ) {
    await this.requests.create(req.venueId!, dto);
  }

  @Post('/:id/approve')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async approve(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) id: string,
  ) {
    await this.requests.approve(req.venueId!, id);
  }

  @Post('/:id/reject')
  @UseGuards(VenueAccessGuard, StaffGuard)
  async reject(
    @Req() req: Request,
    @Param('id', new ZodValidationPipe(z.uuid())) id: string,
  ) {
    await this.requests.reject(req.venueId!, id);
  }
}
