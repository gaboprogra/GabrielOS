import type { DailyPlanItemAction } from "./daily-plan-item-status";

export type DailyPlanCalendarEffect = "KEEP" | "DELETE" | "ENSURE";

export function getCalendarEffectForDailyPlanAction(
  action: DailyPlanItemAction,
): DailyPlanCalendarEffect {
  if (
    action === "COMPLETE" ||
    action === "SKIP" ||
    action === "CANCEL" ||
    action === "REMOVE"
  ) {
    return "DELETE";
  }

  if (action === "RESTORE_TO_PLANNED") {
    return "ENSURE";
  }

  return "KEEP";
}
