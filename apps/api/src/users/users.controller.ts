import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ZodValidationPipe } from '../zod-validation.pipe';
import {
  createUserSchema,
  type CreateUserDto,
  type UserDto,
} from '@skrd/contracts';
import z from 'zod';

@Controller('/users')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('/')
  list(): Promise<UserDto[]> {
    return this.users.list();
  }

  @Post('/')
  create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ): Promise<UserDto> {
    return this.users.create(dto);
  }

  @Delete('/:id')
  async remove(@Param('id', new ZodValidationPipe(z.uuid())) id: string) {
    await this.users.remove(id);
  }
}
