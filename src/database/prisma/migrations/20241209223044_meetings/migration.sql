/*
  Warnings:

  - You are about to drop the column `date` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `meetings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notice_id]` on the table `meetings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agenda_id]` on the table `meetings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[minutes_id]` on the table `meetings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end` to the `meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `meetings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "meetings_url_key";

-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "date",
DROP COLUMN "url",
ADD COLUMN     "agenda_id" UUID,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "end" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "minutes_id" UUID,
ADD COLUMN     "notice_id" UUID,
ADD COLUMN     "start" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "type" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "meeting_agenda_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "start" TIMESTAMPTZ(6) NOT NULL,
    "end" TIMESTAMPTZ(6) NOT NULL,
    "meeting_id" UUID NOT NULL,

    CONSTRAINT "meeting_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingAgendaAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_url" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "meetingAgendaItemId" UUID NOT NULL,

    CONSTRAINT "MeetingAgendaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_url" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MeetingAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "start" TIMESTAMPTZ(6) NOT NULL,
    "end" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,
    "happenedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meetings_notice_id_key" ON "meetings"("notice_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_agenda_id_key" ON "meetings"("agenda_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_minutes_id_key" ON "meetings"("minutes_id");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_notice_id_fkey" FOREIGN KEY ("notice_id") REFERENCES "MeetingAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "MeetingAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_minutes_id_fkey" FOREIGN KEY ("minutes_id") REFERENCES "MeetingAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agenda_items" ADD CONSTRAINT "meeting_agenda_items_meeting_id_foreign" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MeetingAgendaAttachment" ADD CONSTRAINT "MeetingAgendaAttachment_meetingAgendaItemId_fkey" FOREIGN KEY ("meetingAgendaItemId") REFERENCES "meeting_agenda_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_meeting_id_foreign" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_member_id_foreign" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meeting_logs" ADD CONSTRAINT "meeting_logs_meeting_id_foreign" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meeting_logs" ADD CONSTRAINT "meeting_logs_member_id_foreign" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
