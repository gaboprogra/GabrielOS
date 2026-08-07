import { deleteGoogleCalendarEvent } from "@/infrastructure/google-calendar/google-calendar-bridge";

import { changeDailyPlanItemStatusSchema } from "../domain/change-daily-plan-item-status-schema";
import {
  changeDailyPlanItemStatusWithHistory,
  markCalendarEventDeletionFailed,
  markCalendarEventDeletionSucceeded,
  recordRemovedItemCalendarSyncFailure,
} from "../infrastructure/daily-plan-repository";

type ChangeDailyPlanItemStatusCommand = {
  userId: string;
  dailyPlanItemId: unknown;
  action: unknown;
  now: Date;
};

export type ChangeDailyPlanItemStatusResult =
  | {
      success: true;
      removed: boolean;
    }
  | {
      success: false;
      error: string;
    };

export async function changeDailyPlanItemStatus(
  command: ChangeDailyPlanItemStatusCommand,
): Promise<ChangeDailyPlanItemStatusResult> {
  const validation = changeDailyPlanItemStatusSchema.safeParse({
    dailyPlanItemId: command.dailyPlanItemId,
    action: command.action,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "La acción no es válida.",
    };
  }

  const result = await changeDailyPlanItemStatusWithHistory({
    userId: command.userId,
    dailyPlanItemId: validation.data.dailyPlanItemId,
    action: validation.data.action,
    now: command.now,
  });

  if (!result.success) {
    return result;
  }

  for (const target of result.calendarEventDeletions) {
    const calendarResult = await deleteGoogleCalendarEvent({
      eventId: target.eventId,
    });

    if (calendarResult.success) {
      if (!target.itemRemoved) {
        await markCalendarEventDeletionSucceeded(
          command.userId,
          target.dailyPlanItemId,
          target.eventId,
          new Date(),
        );
      }

      continue;
    }

    if (target.itemRemoved) {
      await recordRemovedItemCalendarSyncFailure(
        command.userId,
        target.dailyPlanItemId,
        target.eventId,
        calendarResult.error,
      );
    } else {
      await markCalendarEventDeletionFailed(
        command.userId,
        target.dailyPlanItemId,
        target.eventId,
        calendarResult.error,
      );
    }
  }

  return {
    success: true,
    removed: result.removed,
  };
}
