type TaskKind = "ONE_TIME" | "REUSABLE";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type TaskRestoreAfterPlanItemResult = {
  fromStatus: "IN_PROGRESS" | "COMPLETED";
  patch: {
    status: "PENDING";
    completedAt: null;
  };
} | null;

export function getTaskRestoreAfterPlanItem(
  kind: TaskKind,
  status: TaskStatus,
): TaskRestoreAfterPlanItemResult {
  if (
    kind !== "ONE_TIME" ||
    (status !== "IN_PROGRESS" && status !== "COMPLETED")
  ) {
    return null;
  }

  return {
    fromStatus: status,
    patch: {
      status: "PENDING",
      completedAt: null,
    },
  };
}
