import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import {
  updateVenueSettingsSchema,
  type VenueSettingsDto,
} from '@skrd/contracts';
import { SettingsService } from './settings.service';

@Controller('/venues/:slug/settings')
@UseGuards(VenueAccessGuard, StaffGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('/')
  get(@Req() req: Request): Promise<VenueSettingsDto> {
    return this.settings.get(req.venueId!);
  }

  @Patch('/')
  update(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updateVenueSettingsSchema)) body: {
      skipOnError: boolean;
    },
  ): Promise<VenueSettingsDto> {
    return this.settings.update(req.venueId!, body.skipOnError);
  }
}
