-- Replace username with a display name; email is now the login identifier.
ALTER TABLE "User" ADD COLUMN "name" TEXT;

UPDATE "User" SET "name" = "username" WHERE "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "User" DROP COLUMN "username";
