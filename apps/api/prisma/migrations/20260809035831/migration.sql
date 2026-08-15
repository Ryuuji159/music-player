/*
  Warnings:

  - You are about to drop the column `url` on the `MediaItem` table. All the data in the column will be lost.
  - Added the required column `channelTitle` to the `MediaItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `MediaItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `embeddable` to the `MediaItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoId` to the `MediaItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaItem" DROP COLUMN "url",
ADD COLUMN     "channelTitle" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "embeddable" BOOLEAN NOT NULL,
ADD COLUMN     "videoId" TEXT NOT NULL;
