import { addDaysToDateInput } from "@/shared/domain/date-input";
import { formatBoliviaDateInput } from "@/shared/domain/bolivia-date-time";

import type { DayOfWeek } from "./routine-schema";

type TaskKind = "ONE_TIME" | "REUSABLE";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
type DailyPlanItemStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED";

const DAY_BY_UTC_INDEX: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export type RoutineOccurrence = {
  routineScheduleId: string;
  occurrenceDate: string;
  startTime: string;
  endTime: string;
};

export function canTaskUseRoutine(kind: TaskKind, status: TaskStatus) {
  if (kind !== "REUSABLE") {
    return {
      success: false as const,
      error: "Solo una tarea reutilizable puede asociarse a una rutina.",
    };
  }

  if (status === "ARCHIVED") {
    return {
      success: false as const,
      error: "Una tarea archivada no puede asociarse a una rutina.",
    };
  }

  return { success: true as const };
}

export function canReconcileRoutineOccurrence(
  status: DailyPlanItemStatus,
  isRoutineException: boolean,
): boolean {
  return status === "PLANNED" && !isRoutineException;
}

export function getRoutineWindow(now: Date) {
  const startDate = formatBoliviaDateInput(now);

  return {
    startDate,
    endDate: addDaysToDateInput(startDate, 6),
  };
}

export function calculateRoutineOccurrences(input: {
  windowStartDate: string;
  routineStartDate: string;
  routineEndDate: string | null;
  schedules: Array<{
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
}): RoutineOccurrence[] {
  const schedulesByDay = new Map(
    input.schedules.map((schedule) => [schedule.dayOfWeek, schedule]),
  );
  const occurrences: RoutineOccurrence[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const occurrenceDate = addDaysToDateInput(input.windowStartDate, offset);

    if (occurrenceDate < input.routineStartDate) {
      continue;
    }

    if (input.routineEndDate && occurrenceDate > input.routineEndDate) {
      continue;
    }

    const date = new Date(`${occurrenceDate}T00:00:00.000Z`);
    const dayOfWeek = DAY_BY_UTC_INDEX[date.getUTCDay()];
    const schedule = dayOfWeek ? schedulesByDay.get(dayOfWeek) : undefined;

    if (!schedule) {
      continue;
    }

    occurrences.push({
      routineScheduleId: schedule.id,
      occurrenceDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  }

  return occurrences;
}
