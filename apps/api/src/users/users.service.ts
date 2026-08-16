import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../auth/password';
import { toUserDto } from '../auth/user.mapper';
import type { CreateUserDto, UserDto } from '@skrd/contracts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      include: { venue: true },
    });
    return users.map(toUserDto);
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash: hashPassword(dto.password),
        role: dto.role,
        venueId: dto.venueId ?? null,
      },
      include: { venue: true },
    });
    return toUserDto(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
  }
}
