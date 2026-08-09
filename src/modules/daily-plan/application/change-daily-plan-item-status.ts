import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEvent,
} from "@/infrastructure/google-calendar/google-calendar-bridge";
import { mapHexToGoogleCalendarColor } from "@/infrastructure/google-calendar/google-calendar-event-color";

import { changeDailyPlanItemStatusSchema } from "../domain/change-daily-plan-item-status-schema";
import {
  changeDailyPlanItemStatusWithHistory,
  markCalendarEventUpdateFailed,
  markCalendarEventUpdateSucceeded,
  markCalendarEventDeletionFailed,
  markCalendarEventDeletionSucceeded,
  markCalendarSyncFailed,
  markCalendarSyncSucceeded,
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

  for (const target of result.calendarEventRestorations) {
    const calendarColor = mapHexToGoogleCalendarColor(target.categoryColor);

    if (target.eventId) {
      const calendarResult = await updateGoogleCalendarEvent({
        eventId: target.eventId,
        title: target.title,
        startsAt: target.startsAt,
        endsAt: target.endsAt,
        notes: target.notes,
        calendarColor,
      });

      if (calendarResult.success) {
        await markCalendarEventUpdateSucceeded(
          command.userId,
          target.dailyPlanItemId,
          target.eventId,
          new Date(),
        );
      } else {
        await markCalendarEventUpdateFailed(
          command.userId,
          target.dailyPlanItemId,
          target.eventId,
          calendarResult.error,
        );
      }

      continue;
    }

    const calendarResult = await createGoogleCalendarEvent({
      dailyPlanItemId: target.dailyPlanItemId,
      title: target.title,
      startsAt: target.startsAt,
      endsAt: target.endsAt,
      notes: target.notes,
      calendarColor,
    });

    if (calendarResult.success) {
      await markCalendarSyncSucceeded(
        command.userId,
        target.dailyPlanItemId,
        calendarResult.eventId,
        new Date(),
      );
    } else {
      await markCalendarSyncFailed(
        command.userId,
        target.dailyPlanItemId,
        calendarResult.error,
      );
    }
  }

  return {
    success: true,
    removed: result.removed,
  };
}
