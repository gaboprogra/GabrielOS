import type { DailyPlanItemStatus } from "./daily-plan-item-status";

type TaskKind = "ONE_TIME" | "REUSABLE";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type DailyPlanItemRemovalResult =
  | {
      success: true;
      resetTaskToPending: boolean;
    }
  | {
      success: false;
      error: string;
    };

export function getDailyPlanItemRemoval(
  itemStatus: DailyPlanItemStatus,
  taskKind: TaskKind,
  taskStatus: TaskStatus,
): DailyPlanItemRemovalResult {
  if (itemStatus === "COMPLETED") {
    return {
      success: false,
      error: "Una actividad completada no puede quitarse del plan.",
    };
  }

  return {
    success: true,
    resetTaskToPending:
      taskKind === "ONE_TIME" && taskStatus === "IN_PROGRESS",
  };
}
