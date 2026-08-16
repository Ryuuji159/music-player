import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ZodValidationPipe } from '../zod-validation.pipe';
import {
  createVenueSchema,
  type CreateVenueDto,
  type VenueDto,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/venues')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Get('/')
  list(): Promise<VenueDto[]> {
    return this.venues.list();
  }

  @Post('/')
  create(
    @Body(new ZodValidationPipe(createVenueSchema)) dto: CreateVenueDto,
  ): Promise<VenueDto> {
    return this.venues.create(dto);
  }

  @Delete('/:id')
  async remove(@Param('id', new ZodValidationPipe(z.uuid())) id: string) {
    await this.venues.remove(id);
  }
}
