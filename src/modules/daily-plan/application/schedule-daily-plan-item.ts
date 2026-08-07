import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";
import { parseDateInput } from "@/shared/domain/date-input";

import { scheduleDailyPlanItemSchema } from "../domain/schedule-daily-plan-item-schema";
import { createDailyPlanItemWithHistory } from "../infrastructure/daily-plan-repository";

type ScheduleDailyPlanItemCommand = {
  userId: string;
  taskId: unknown;
  plannedDate: unknown;
  startTime: unknown;
  endTime: unknown;
  notes: unknown;
};

export type ScheduleDailyPlanItemResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function scheduleDailyPlanItem(
  command: ScheduleDailyPlanItemCommand,
): Promise<ScheduleDailyPlanItemResult> {
  const validation = scheduleDailyPlanItemSchema.safeParse({
    taskId: command.taskId,
    plannedDate: command.plannedDate,
    startTime: command.startTime,
    endTime: command.endTime,
    notes: command.notes,
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "Los datos del horario no son válidos.",
    };
  }

  const plannedDate = parseDateInput(validation.data.plannedDate);

  const startsAt = parseBoliviaDateTime(
    `${validation.data.plannedDate}T${validation.data.startTime}`,
  );

  const endsAt = parseBoliviaDateTime(
    `${validation.data.plannedDate}T${validation.data.endTime}`,
  );

  if (!plannedDate || !startsAt || !endsAt) {
    return {
      success: false,
      error: "No se pudo interpretar la fecha o el horario.",
    };
  }

  const result = await createDailyPlanItemWithHistory({
    userId: command.userId,
    taskId: validation.data.taskId,
    plannedDate,
    startsAt,
    endsAt,
    notes: validation.data.notes,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
  };
}
