CREATE TYPE "DayOfWeek" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);

CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoutineSchedule" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoutineOccurrenceExclusion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineScheduleId" TEXT NOT NULL,
    "occurrenceDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineOccurrenceExclusion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DailyPlanItem"
ADD COLUMN "routineScheduleId" TEXT,
ADD COLUMN "routineOccurrenceDate" DATE,
ADD COLUMN "isRoutineException" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Routine_userId_isActive_startDate_endDate_idx"
ON "Routine"("userId", "isActive", "startDate", "endDate");

CREATE INDEX "Routine_taskId_idx" ON "Routine"("taskId");

CREATE UNIQUE INDEX "RoutineSchedule_routineId_dayOfWeek_key"
ON "RoutineSchedule"("routineId", "dayOfWeek");

CREATE INDEX "RoutineSchedule_routineId_isActive_idx"
ON "RoutineSchedule"("routineId", "isActive");

CREATE UNIQUE INDEX "RoutineOccurrenceExclusion_routineScheduleId_occurrenceDate_key"
ON "RoutineOccurrenceExclusion"("routineScheduleId", "occurrenceDate");

CREATE INDEX "RoutineOccurrenceExclusion_userId_occurrenceDate_idx"
ON "RoutineOccurrenceExclusion"("userId", "occurrenceDate");

CREATE INDEX "DailyPlanItem_routineScheduleId_idx"
ON "DailyPlanItem"("routineScheduleId");

CREATE UNIQUE INDEX "DailyPlanItem_routineScheduleId_routineOccurrenceDate_key"
ON "DailyPlanItem"("routineScheduleId", "routineOccurrenceDate");

ALTER TABLE "Routine"
ADD CONSTRAINT "Routine_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Routine"
ADD CONSTRAINT "Routine_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RoutineSchedule"
ADD CONSTRAINT "RoutineSchedule_routineId_fkey"
FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoutineOccurrenceExclusion"
ADD CONSTRAINT "RoutineOccurrenceExclusion_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoutineOccurrenceExclusion"
ADD CONSTRAINT "RoutineOccurrenceExclusion_routineScheduleId_fkey"
FOREIGN KEY ("routineScheduleId") REFERENCES "RoutineSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyPlanItem"
ADD CONSTRAINT "DailyPlanItem_routineScheduleId_fkey"
FOREIGN KEY ("routineScheduleId") REFERENCES "RoutineSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
