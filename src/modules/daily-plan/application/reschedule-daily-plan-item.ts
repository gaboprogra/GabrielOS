import { updateGoogleCalendarEvent } from "@/infrastructure/google-calendar/google-calendar-bridge";
import { mapHexToGoogleCalendarColor } from "@/infrastructure/google-calendar/google-calendar-event-color";
import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";
import { parseDateInput } from "@/shared/domain/date-input";

import { rescheduleDailyPlanItemSchema } from "../domain/reschedule-daily-plan-item-schema";
import {
  markCalendarEventUpdateFailed,
  markCalendarEventUpdateSucceeded,
  rescheduleDailyPlanItemWithHistory,
} from "../infrastructure/daily-plan-repository";

type RescheduleDailyPlanItemCommand = {
  userId: string;
  dailyPlanItemId: unknown;
  plannedDate: unknown;
  startTime: unknown;
  endTime: unknown;
  notes: unknown;
};

export type RescheduleDailyPlanItemResult =
  | {
      success: true;
      plannedDate: string;
      calendarSynced: boolean;
    }
  | {
      success: false;
      error: string;
    };

export async function rescheduleDailyPlanItem(
  command: RescheduleDailyPlanItemCommand,
): Promise<RescheduleDailyPlanItemResult> {
  const validation = rescheduleDailyPlanItemSchema.safeParse({
    dailyPlanItemId: command.dailyPlanItemId,
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
        "Los datos de la reprogramación no son válidos.",
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

  const result = await rescheduleDailyPlanItemWithHistory({
    userId: command.userId,
    dailyPlanItemId: validation.data.dailyPlanItemId,
    plannedDate,
    startsAt,
    endsAt,
    notes: validation.data.notes,
  });

  if (!result.success) {
    return result;
  }

  const targetDate = result.plannedDate.toISOString().slice(0, 10);

  if (!result.changed || !result.calendarEventUpdate) {
    return {
      success: true,
      plannedDate: targetDate,
      calendarSynced: true,
    };
  }

  const calendarResult = await updateGoogleCalendarEvent({
    ...result.calendarEventUpdate,
    calendarColor: mapHexToGoogleCalendarColor(
      result.calendarEventUpdate.categoryColor,
    ),
  });

  if (!calendarResult.success) {
    await markCalendarEventUpdateFailed(
      command.userId,
      validation.data.dailyPlanItemId,
      result.calendarEventUpdate.eventId,
      calendarResult.error,
    );

    return {
      success: true,
      plannedDate: targetDate,
      calendarSynced: false,
    };
  }

  await markCalendarEventUpdateSucceeded(
    command.userId,
    validation.data.dailyPlanItemId,
    result.calendarEventUpdate.eventId,
    new Date(),
  );

  return {
    success: true,
    plannedDate: targetDate,
    calendarSynced: true,
  };
}
