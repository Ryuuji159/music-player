import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { InviteService } from './invite.service';
import { VenueAccessGuard } from '../auth/guards/venue-access.guard';
import { StaffGuard } from '../auth/guards/staff.guard';
import type { JoinResponseDto, VenueInviteDto } from '@skrd/contracts';

@Controller()
export class InviteController {
  constructor(private readonly invite: InviteService) {}

  @Get('/venues/:slug/invite')
  @UseGuards(VenueAccessGuard, StaffGuard)
  current(@Req() req: Request): Promise<VenueInviteDto> {
    return this.invite.current(req.venueId!);
  }

  @Post('/venues/:slug/invite/rotate')
  @UseGuards(VenueAccessGuard, StaffGuard)
  rotate(@Req() req: Request): Promise<VenueInviteDto> {
    return this.invite.rotate(req.venueId!);
  }

  @Post('/join/:token')
  async join(
    @Param('token') token: string,
    @Req() req: Request,
  ): Promise<JoinResponseDto> {
    const result = await this.invite.join(token);
    if (!result) throw new UnauthorizedException('Invalid or expired invite');

    req.session!.guestVenueId = result.venueId;
    req.session!.cookie.maxAge = this.invite.guestSessionTtlMs;

    return { venueSlug: result.venueSlug };
  }
}
