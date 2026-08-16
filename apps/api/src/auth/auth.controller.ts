import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { loginSchema, type LoginDto, type UserDto } from '@skrd/contracts';

@Controller('/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('/login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const user = await this.auth.validate(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    req.session!.userId = user.id;
    req.session!.cookie.maxAge = this.auth.staffMaxAgeMs;

    return this.auth.toUserDto(user);
  }

  @Post('/logout')
  async logout(@Req() req: Request) {
    if (!req.session) return;

    await new Promise<void>((resolve, reject) => {
      req.session!.destroy((err) => (err ? reject(err) : resolve()));
    });
  }

  @Get('/me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: Request): UserDto {
    return this.auth.toUserDto(req.user!);
  }
}
