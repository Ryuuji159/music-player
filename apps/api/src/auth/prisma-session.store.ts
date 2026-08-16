import { Injectable } from '@nestjs/common';
import { Store, type SessionData } from 'express-session';
import { PrismaService } from '../prisma/prisma.service';

const FALLBACK_TTL_MS = 24 * 60 * 60 * 1000;

function toExpiresAt(sess: SessionData): Date {
  return sess.cookie?.expires
    ? new Date(sess.cookie.expires)
    : new Date(Date.now() + FALLBACK_TTL_MS);
}

@Injectable()
export class PrismaSessionStore extends Store {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  get(
    sid: string,
    callback: (err: any, session?: SessionData | null) => void,
  ): void {
    void (async () => {
      try {
        const row = await this.prisma.session.findUnique({ where: { sid } });
        if (!row) return callback(null, null);

        if (row.expiresAt.getTime() <= Date.now()) {
          await this.prisma.session.deleteMany({ where: { sid } });
          return callback(null, null);
        }

        callback(null, row.data as unknown as SessionData);
      } catch (err) {
        callback(err);
      }
    })();
  }

  set(sid: string, sess: SessionData, callback?: (err?: any) => void): void {
    void (async () => {
      try {
        const data = JSON.parse(JSON.stringify(sess));
        const expiresAt = toExpiresAt(sess);

        await this.prisma.session.upsert({
          where: { sid },
          create: { sid, data, expiresAt },
          update: { data, expiresAt },
        });

        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    void (async () => {
      try {
        await this.prisma.session.deleteMany({ where: { sid } });
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  touch(sid: string, sess: SessionData, callback?: (err?: any) => void): void {
    void (async () => {
      try {
        await this.prisma.session.update({
          where: { sid },
          data: { expiresAt: toExpiresAt(sess) },
        });
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }
}
