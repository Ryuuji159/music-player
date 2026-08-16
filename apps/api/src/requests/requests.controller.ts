import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import {
  createSongRequestSchema,
  type CreateSongRequestDto,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/requests')
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Get('/')
  list() {
    return this.requests.list();
  }

  @Post('/')
  async create(
    @Body(new ZodValidationPipe(createSongRequestSchema))
    dto: CreateSongRequestDto,
  ) {
    await this.requests.create(dto);
  }

  @Post('/:id/approve')
  async approve(@Param('id', new ZodValidationPipe(z.uuid())) id: string) {
    await this.requests.approve(id);
  }

  @Post('/:id/reject')
  async reject(@Param('id', new ZodValidationPipe(z.uuid())) id: string) {
    await this.requests.reject(id);
  }
}
