import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";
import { parseDateInput } from "@/shared/domain/date-input";

import { getRoutineWindow } from "../domain/routine-rules";
import {
  cancelRoutinePlannedItem,
  listRoutineItemsForReconciliation,
  updateRoutinePlannedItem,
} from "../infrastructure/routine-repository";
import { syncRoutineCalendarChange } from "./sync-routine-calendar-change";

export async function reconcileRoutineWindow(input: {
  userId: string;
  routineId: string;
  now: Date;
}) {
  const window = getRoutineWindow(input.now);
  const windowStartDate = parseDateInput(window.startDate);
  const windowEndDate = parseDateInput(window.endDate);

  if (!windowStartDate || !windowEndDate) {
    throw new Error("No se pudo determinar la ventana de rutinas.");
  }

  const items = await listRoutineItemsForReconciliation({
    userId: input.userId,
    routineId: input.routineId,
    windowStartDate,
    windowEndDate,
  });
  let conflicts = 0;
  let calendarFailures = 0;

  for (const item of items) {
    const schedule = item.routineSchedule;
    const occurrenceDate = item.routineOccurrenceDate;
    const routine = schedule?.routine;
    const shouldCancel =
      !schedule ||
      !occurrenceDate ||
      !schedule.isActive ||
      !routine?.isActive ||
      routine.task.kind !== "REUSABLE" ||
      routine.task.status === "ARCHIVED" ||
      occurrenceDate < routine.startDate ||
      (routine.endDate !== null && occurrenceDate > routine.endDate);

    if (shouldCancel) {
      const change = await cancelRoutinePlannedItem({
        userId: input.userId,
        dailyPlanItemId: item.id,
        now: input.now,
        reason: "ROUTINE_RULE_CHANGED",
      });

      if (change && !(await syncRoutineCalendarChange(input.userId, change))) {
        calendarFailures += 1;
      }
      continue;
    }

    const dateInput = occurrenceDate.toISOString().slice(0, 10);
    const startsAt = parseBoliviaDateTime(`${dateInput}T${schedule.startTime}`);
    const endsAt = parseBoliviaDateTime(`${dateInput}T${schedule.endTime}`);

    if (!startsAt || !endsAt) {
      throw new Error("Un horario de rutina guardado no es válido.");
    }

    const update = await updateRoutinePlannedItem({
      userId: input.userId,
      dailyPlanItemId: item.id,
      plannedDate: occurrenceDate,
      startsAt,
      endsAt,
      title: routine.task.title,
      categoryColor: routine.task.category?.color ?? null,
    });

    if (update.status === "conflict") {
      conflicts += 1;
      const change = await cancelRoutinePlannedItem({
        userId: input.userId,
        dailyPlanItemId: item.id,
        now: input.now,
        reason: "ROUTINE_UPDATE_CONFLICT",
      });
      console.warn("Ocurrencia futura cancelada por conflicto al editar rutina", {
        userId: input.userId,
        routineId: input.routineId,
        dailyPlanItemId: item.id,
        conflictingTaskTitle: update.conflictingTaskTitle,
      });
      if (change && !(await syncRoutineCalendarChange(input.userId, change))) {
        calendarFailures += 1;
      }
      continue;
    }

    if (
      update.status === "updated" &&
      update.calendarChange &&
      !(await syncRoutineCalendarChange(input.userId, update.calendarChange))
    ) {
      calendarFailures += 1;
    }
  }

  return { conflicts, calendarFailures };
}
