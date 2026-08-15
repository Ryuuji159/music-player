/*
  Warnings:

  - The `status` column on the `QueueItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('queued', 'playing', 'paused');

-- AlterTable
ALTER TABLE "QueueItem" DROP COLUMN "status",
ADD COLUMN     "status" "QueueStatus" NOT NULL DEFAULT 'queued';
