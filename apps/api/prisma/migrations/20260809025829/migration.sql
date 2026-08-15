/*
  Warnings:

  - Added the required column `mediaId` to the `QueueItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QueueItem" ADD COLUMN     "mediaId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QueueItem" ADD CONSTRAINT "QueueItem_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
