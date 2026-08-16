import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { VenueInviteDto } from '@skrd/contracts';

const DEFAULT_INVITE_TTL_MS = 60_000;
const DEFAULT_GUEST_TTL_MS = 4 * 60 * 60 * 1000;

@Injectable()
export class InviteService {
  private readonly inviteTtlMs: number;
  private readonly guestTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.inviteTtlMs = Number(
      config.get('INVITE_TTL_MS') ?? DEFAULT_INVITE_TTL_MS,
    );
    this.guestTtlMs = Number(
      config.get('GUEST_SESSION_TTL_MS') ?? DEFAULT_GUEST_TTL_MS,
    );
  }

  get guestSessionTtlMs(): number {
    return this.guestTtlMs;
  }

  async current(venueId: string): Promise<VenueInviteDto> {
    const latest = await this.prisma.venueInvite.findFirst({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
    });

    if (latest && latest.expiresAt.getTime() > Date.now()) {
      return { token: latest.token, expiresAt: latest.expiresAt.toISOString() };
    }

    return this.rotate(venueId);
  }

  async rotate(venueId: string): Promise<VenueInviteDto> {
    const token = randomBytes(24).toString('hex');
    const invite = await this.prisma.venueInvite.create({
      data: {
        venueId,
        token,
        expiresAt: new Date(Date.now() + this.inviteTtlMs),
      },
    });

    return { token: invite.token, expiresAt: invite.expiresAt.toISOString() };
  }

  async join(
    token: string,
  ): Promise<{ venueId: string; venueSlug: string } | null> {
    const invite = await this.prisma.venueInvite.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      include: { venue: true },
    });
    if (!invite) return null;

    return { venueId: invite.venueId, venueSlug: invite.venue.slug };
  }
}
