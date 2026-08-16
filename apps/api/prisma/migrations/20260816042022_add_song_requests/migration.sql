-- CreateEnum
CREATE TYPE "SongRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "SongRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mediaId" UUID NOT NULL,
    "status" "SongRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SongRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SongRequest" ADD CONSTRAINT "SongRequest_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
