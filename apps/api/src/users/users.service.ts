import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../auth/password';
import { toUserDto } from '../auth/user.mapper';
import type { CreateUserDto, UpdateUserDto, UserDto } from '@skrd/contracts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      include: { venues: true },
    });
    return users.map(toUserDto);
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: hashPassword(dto.password),
        role: dto.role,
        venues: { connect: dto.venueIds.map((id) => ({ id })) },
      },
      include: { venues: true },
    });
    return toUserDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        ...(dto.password ? { passwordHash: hashPassword(dto.password) } : {}),
        role: dto.role,
        venues: { set: dto.venueIds.map((venueId) => ({ id: venueId })) },
      },
      include: { venues: true },
    });
    return toUserDto(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
  }
}
