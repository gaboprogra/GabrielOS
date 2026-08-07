import type { DailyPlanItemStatus } from "./daily-plan-item-status";

export type DailyPlanItemRescheduleResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export function getDailyPlanItemReschedule(
  status: DailyPlanItemStatus,
): DailyPlanItemRescheduleResult {
  if (status !== "PLANNED") {
    return {
      success: false,
      error: "Solo una actividad programada puede reprogramarse.",
    };
  }

  return {
    success: true,
  };
}
