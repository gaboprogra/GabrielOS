import type { DailyPlanItemStatus } from "./daily-plan-item-status";

export type DailyPlanItemRescheduleResult =
  | {
      success: true;
      patch: {
        status: "PLANNED";
        completedAt: null;
        skippedAt: null;
        cancelledAt: null;
      };
    }
  | {
      success: false;
      error: string;
    };

export function getDailyPlanItemReschedule(
  status: DailyPlanItemStatus,
): DailyPlanItemRescheduleResult {
  if (status !== "PLANNED" && status !== "IN_PROGRESS") {
    return {
      success: false,
      error: "Esta actividad ya no puede reprogramarse.",
    };
  }

  return {
    success: true,
    patch: {
      status: "PLANNED",
      completedAt: null,
      skippedAt: null,
      cancelledAt: null,
    },
  };
}
