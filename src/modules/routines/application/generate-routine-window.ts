import { createGoogleCalendarEvent } from "@/infrastructure/google-calendar/google-calendar-bridge";
import { mapHexToGoogleCalendarColor } from "@/infrastructure/google-calendar/google-calendar-event-color";
import {
  markCalendarSyncFailed,
  markCalendarSyncSucceeded,
} from "@/modules/daily-plan/infrastructure/daily-plan-repository";
import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";
import { formatDateInput, parseDateInput } from "@/shared/domain/date-input";

import {
  calculateRoutineOccurrences,
  getRoutineWindow,
} from "../domain/routine-rules";
import {
  createRoutineOccurrenceWithHistory,
  listRoutineOwnerIds,
  listRoutinesForGeneration,
} from "../infrastructure/routine-repository";

export type RoutineGenerationSummary = {
  created: number;
  existing: number;
  excluded: number;
  conflicts: number;
  calendarFailures: number;
};

export async function generateRoutineWindow(input: {
  userId: string;
  routineId?: string;
  now: Date;
}): Promise<RoutineGenerationSummary> {
  const window = getRoutineWindow(input.now);
  const routines = await listRoutinesForGeneration(
    input.userId,
    input.routineId,
  );
  const summary: RoutineGenerationSummary = {
    created: 0,
    existing: 0,
    excluded: 0,
    conflicts: 0,
    calendarFailures: 0,
  };

  for (const routine of routines) {
    const occurrences = calculateRoutineOccurrences({
      windowStartDate: window.startDate,
      routineStartDate: formatDateInput(routine.startDate),
      routineEndDate: routine.endDate ? formatDateInput(routine.endDate) : null,
      schedules: routine.schedules,
    });

    for (const occurrence of occurrences) {
      const occurrenceDate = parseDateInput(occurrence.occurrenceDate);
      const startsAt = parseBoliviaDateTime(
        `${occurrence.occurrenceDate}T${occurrence.startTime}`,
      );
      const endsAt = parseBoliviaDateTime(
        `${occurrence.occurrenceDate}T${occurrence.endTime}`,
      );

      if (!occurrenceDate || !startsAt || !endsAt) {
        throw new Error("Una ocurrencia de rutina contiene una fecha inválida.");
      }

      const result = await createRoutineOccurrenceWithHistory({
        userId: input.userId,
        routineId: routine.id,
        routineScheduleId: occurrence.routineScheduleId,
        occurrenceDate,
        startsAt,
        endsAt,
      });

      if (result.status === "existing") {
        summary.existing += 1;
        continue;
      }

      if (result.status === "excluded") {
        summary.excluded += 1;
        continue;
      }

      if (result.status === "conflict") {
        summary.conflicts += 1;
        console.warn("Ocurrencia de rutina omitida por conflicto de horario", {
          userId: input.userId,
          routineId: routine.id,
          routineScheduleId: occurrence.routineScheduleId,
          occurrenceDate: occurrence.occurrenceDate,
          conflictingTaskTitle: result.conflictingTaskTitle,
        });
        continue;
      }

      summary.created += 1;

      const calendarResult = await createGoogleCalendarEvent({
        dailyPlanItemId: result.dailyPlanItemId,
        title: result.title,
        startsAt: result.startsAt,
        endsAt: result.endsAt,
        notes: result.notes,
        calendarColor: mapHexToGoogleCalendarColor(result.categoryColor),
      });

      if (!calendarResult.success) {
        summary.calendarFailures += 1;
        await markCalendarSyncFailed(
          input.userId,
          result.dailyPlanItemId,
          calendarResult.error,
        );
        continue;
      }

      await markCalendarSyncSucceeded(
        input.userId,
        result.dailyPlanItemId,
        calendarResult.eventId,
        new Date(),
      );
    }
  }

  return summary;
}

export async function generateAllRoutineWindows(now: Date) {
  const userIds = await listRoutineOwnerIds();
  const summaries: Array<{ userId: string; summary: RoutineGenerationSummary }> = [];

  for (const userId of userIds) {
    summaries.push({
      userId,
      summary: await generateRoutineWindow({ userId, now }),
    });
  }

  return summaries;
}
