-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "image_urls" TEXT[];

-- AlterTable
ALTER TABLE "mandates" ALTER COLUMN "last_synced" SET DEFAULT TIMESTAMP '1970-01-01 00:00:00';
