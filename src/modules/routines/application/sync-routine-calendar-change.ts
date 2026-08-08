import {
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEvent,
} from "@/infrastructure/google-calendar/google-calendar-bridge";
import { mapHexToGoogleCalendarColor } from "@/infrastructure/google-calendar/google-calendar-event-color";
import {
  markCalendarEventDeletionFailed,
  markCalendarEventDeletionSucceeded,
  markCalendarEventUpdateFailed,
  markCalendarEventUpdateSucceeded,
} from "@/modules/daily-plan/infrastructure/daily-plan-repository";

import type { RoutineCalendarChange } from "../infrastructure/routine-repository";

export async function syncRoutineCalendarChange(
  userId: string,
  change: RoutineCalendarChange,
): Promise<boolean> {
  if (change.operation === "delete") {
    const result = await deleteGoogleCalendarEvent({ eventId: change.eventId });

    if (!result.success) {
      await markCalendarEventDeletionFailed(
        userId,
        change.dailyPlanItemId,
        change.eventId,
        result.error,
      );
      return false;
    }

    await markCalendarEventDeletionSucceeded(
      userId,
      change.dailyPlanItemId,
      change.eventId,
      new Date(),
    );
    return true;
  }

  const result = await updateGoogleCalendarEvent({
    eventId: change.eventId,
    title: change.title,
    startsAt: change.startsAt,
    endsAt: change.endsAt,
    notes: change.notes,
    calendarColor: mapHexToGoogleCalendarColor(change.categoryColor),
  });

  if (!result.success) {
    await markCalendarEventUpdateFailed(
      userId,
      change.dailyPlanItemId,
      change.eventId,
      result.error,
    );
    return false;
  }

  await markCalendarEventUpdateSucceeded(
    userId,
    change.dailyPlanItemId,
    change.eventId,
    new Date(),
  );
  return true;
}
