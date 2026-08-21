import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import z from 'zod';
import type { AdminMediaItemDto } from '@skrd/contracts';
import { AdminMediaService } from './admin-media.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ZodValidationPipe } from '../zod-validation.pipe';

@Controller('/admin/media')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
export class AdminMediaController {
  constructor(private readonly media: AdminMediaService) {}

  @Get('/')
  list(@Query('q') q: string | undefined): Promise<AdminMediaItemDto[]> {
    return this.media.list(q);
  }

  @Delete('/:id')
  async remove(@Param('id', new ZodValidationPipe(z.uuid())) id: string) {
    await this.media.remove(id);
  }
}
