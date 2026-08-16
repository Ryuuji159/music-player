import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YoutubeService } from '../youtube/youtube.service';
import { MediaService } from '../queue/media.service';
import { PlaylistId } from '@skrd/contracts';
import { toPlaylistDetailDto, toPlaylistDto } from './playlist.mapper';
import { notBlockedMediaFilter } from '../player/playback-errors';

const PLAYLIST_LIMIT = 1000;
const MIX_PLAYLIST_LIMIT = 100;

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);

  constructor(
    private prisma: PrismaService,
    private youtube: YoutubeService,
    private mediaService: MediaService,
  ) {}

  async list() {
    const playlists = await this.prisma.playlist.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        items: { take: 1, include: { media: true } },
        _count: { select: { items: true } },
      },
    });
    return playlists.map((p) => toPlaylistDto(p));
  }

  async get(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        items: {
          where: { media: notBlockedMediaFilter },
          orderBy: { position: 'asc' },
          include: { media: true },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return toPlaylistDetailDto(playlist);
  }

  async register(playlistId: PlaylistId) {
    this.logger.log(`Registering playlist ${playlistId}`);

    const info = await this.youtube.getPlaylistInfo(playlistId);
    this.logger.log(`Playlist info: ${info?.title ?? '(no title)'}`);

    const isMix = this.youtube.isMixPlaylist(playlistId, info?.itemCount);
    const limit = isMix ? MIX_PLAYLIST_LIMIT : PLAYLIST_LIMIT;
    if (isMix) {
      this.logger.log(
        `Playlist ${playlistId} detected as mix (radio), limiting to ${limit} videos`,
      );
    }

    const videoIds = await this.youtube.listPlaylistVideoIds(playlistId, limit);
    this.logger.log(`Playlist has ${videoIds.length} videos`);

    const mediaList = await this.mediaService.resolveMany(videoIds);
    this.logger.log(`Resolved ${mediaList.length} media items`);

    const seen = new Set<string>();
    const uniqueMedia = mediaList.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    if (uniqueMedia.length !== mediaList.length) {
      this.logger.log(
        `Deduplicated ${mediaList.length - uniqueMedia.length} repeated media within playlist`,
      );
    }

    const playlist = await this.prisma.playlist.upsert({
      where: { playlistId },
      update: {
        title: info?.title ?? 'Playlist',
        thumbnailUrl: info?.thumbnailUrl,
      },
      create: {
        playlistId,
        title: info?.title ?? 'Playlist',
        thumbnailUrl: info?.thumbnailUrl,
      },
    });

    await this.prisma.playlistItem.deleteMany({
      where: { playlistId: playlist.id },
    });
    await this.prisma.playlistItem.createMany({
      data: uniqueMedia.map((m, i) => ({
        playlistId: playlist.id,
        mediaId: m.id,
        position: i,
      })),
    });

    return playlist;
  }

  async remove(id: string) {
    await this.prisma.playlist.delete({ where: { id } });
  }

  async randomMedia() {
    const count = await this.prisma.playlistItem.count({
      where: { media: notBlockedMediaFilter },
    });
    if (!count) return null;

    const item = await this.prisma.playlistItem.findFirst({
      where: { media: notBlockedMediaFilter },
      skip: Math.floor(Math.random() * count),
      include: { media: true },
    });

    return item?.media ?? null;
  }
}
