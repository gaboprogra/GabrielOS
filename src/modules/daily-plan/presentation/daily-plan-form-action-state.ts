import type { ScheduleConflict } from "../domain/schedule-conflict";
import { formatBoliviaDateTimeInput } from "@/shared/domain/bolivia-date-time";

export type SerializedScheduleConflict = {
  item: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  };
  requestedDurationMinutes: number;
  suggestedSlot: {
    startTime: string;
    endTime: string;
  } | null;
};

export type DailyPlanFormActionState =
  | {
      status: "idle" | "success" | "error";
      message: string;
    }
  | {
      status: "conflict";
      message: string;
      conflict: SerializedScheduleConflict;
    };

export const initialDailyPlanFormActionState: DailyPlanFormActionState = {
  status: "idle",
  message: "",
};

function formatTime(date: Date): string {
  return formatBoliviaDateTimeInput(date).slice(11);
}

export function toScheduleConflictActionState(
  conflict: ScheduleConflict,
): DailyPlanFormActionState {
  return {
    status: "conflict",
    message: "Ese horario ya está ocupado.",
    conflict: {
      item: {
        id: conflict.item.id,
        title: conflict.item.title,
        startTime: formatTime(conflict.item.startsAt),
        endTime: formatTime(conflict.item.endsAt),
      },
      requestedDurationMinutes: conflict.requestedDurationMinutes,
      suggestedSlot: conflict.suggestedSlot
        ? {
            startTime: formatTime(conflict.suggestedSlot.startsAt),
            endTime: formatTime(conflict.suggestedSlot.endsAt),
          }
        : null,
    },
  };
}
