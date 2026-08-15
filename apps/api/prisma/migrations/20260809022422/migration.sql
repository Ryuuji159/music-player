-- CreateTable
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "QueueItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',

    CONSTRAINT "QueueItem_pkey" PRIMARY KEY ("id")
);
