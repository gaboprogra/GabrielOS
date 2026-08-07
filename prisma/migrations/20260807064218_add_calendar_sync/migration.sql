-- CreateEnum
CREATE TYPE "CalendarSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- AlterTable
ALTER TABLE "DailyPlanItem" ADD COLUMN     "calendarSyncError" TEXT,
ADD COLUMN     "calendarSyncStatus" "CalendarSyncStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "calendarSyncedAt" TIMESTAMP(3),
ADD COLUMN     "googleCalendarEventId" TEXT;
