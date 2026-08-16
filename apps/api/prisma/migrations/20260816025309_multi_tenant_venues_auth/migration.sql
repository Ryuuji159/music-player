-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateTable (Venue first so existing rows can be backfilled)
CREATE TABLE "Venue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- Seed default venue for existing data
INSERT INTO "Venue" ("id", "slug", "name") VALUES ('11111111-1111-4111-8111-111111111111', 'default', 'Default');

-- DropIndex
DROP INDEX "Playlist_playlistId_key";

-- AlterTable
ALTER TABLE "MediaItem" DROP COLUMN "playbackErrorCode";

-- Add nullable columns first so we can backfill before enforcing NOT NULL
ALTER TABLE "Playlist" ADD COLUMN "venueId" UUID;

ALTER TABLE "QueueItem" ADD COLUMN "requestedBy" TEXT,
ADD COLUMN "venueId" UUID;

ALTER TABLE "SongRequest" ADD COLUMN "requestedBy" TEXT,
ADD COLUMN "venueId" UUID;

-- Backfill existing rows into the default venue
UPDATE "Playlist" SET "venueId" = '11111111-1111-4111-8111-111111111111' WHERE "venueId" IS NULL;
UPDATE "QueueItem" SET "venueId" = '11111111-1111-4111-8111-111111111111' WHERE "venueId" IS NULL;
UPDATE "SongRequest" SET "venueId" = '11111111-1111-4111-8111-111111111111' WHERE "venueId" IS NULL;

-- Enforce NOT NULL
ALTER TABLE "Playlist" ALTER COLUMN "venueId" SET NOT NULL;
ALTER TABLE "QueueItem" ALTER COLUMN "venueId" SET NOT NULL;
ALTER TABLE "SongRequest" ALTER COLUMN "venueId" SET NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "venueId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sid" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "VenueInvite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venueId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMediaError" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venueId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "errorCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueMediaError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VenueInvite_token_key" ON "VenueInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VenueMediaError_venueId_mediaId_key" ON "VenueMediaError"("venueId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_venueId_playlistId_key" ON "Playlist"("venueId", "playlistId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueInvite" ADD CONSTRAINT "VenueInvite_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMediaError" ADD CONSTRAINT "VenueMediaError_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMediaError" ADD CONSTRAINT "VenueMediaError_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueItem" ADD CONSTRAINT "QueueItem_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongRequest" ADD CONSTRAINT "SongRequest_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
