-- Add email (nullable first), backfill, then enforce NOT NULL + unique
ALTER TABLE "User" ADD COLUMN "email" TEXT;

UPDATE "User" SET "email" = "username" || '@local' WHERE "email" IS NULL;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create the many-to-many join table and migrate existing venue assignment
CREATE TABLE "_UserVenues" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_UserVenues_AB_pkey" PRIMARY KEY ("A","B")
);

INSERT INTO "_UserVenues" ("A", "B")
SELECT "id", "venueId" FROM "User" WHERE "venueId" IS NOT NULL;

CREATE INDEX "_UserVenues_B_index" ON "_UserVenues"("B");

ALTER TABLE "_UserVenues" ADD CONSTRAINT "_UserVenues_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_UserVenues" ADD CONSTRAINT "_UserVenues_B_fkey" FOREIGN KEY ("B") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old single-venue relation
ALTER TABLE "User" DROP CONSTRAINT "User_venueId_fkey";

ALTER TABLE "User" DROP COLUMN "venueId";
