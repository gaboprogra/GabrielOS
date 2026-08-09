import { describe, expect, it } from "vitest";

import { getTaskRestoreAfterPlanItem } from "./get-task-restore-after-plan-item";

describe("getTaskRestoreAfterPlanItem", () => {
  it("devuelve una ONE_TIME completada a PENDING", () => {
    expect(getTaskRestoreAfterPlanItem("ONE_TIME", "COMPLETED")).toEqual({
      fromStatus: "COMPLETED",
      patch: {
        status: "PENDING",
        completedAt: null,
      },
    });
  });

  it("devuelve una ONE_TIME en progreso a PENDING", () => {
    expect(getTaskRestoreAfterPlanItem("ONE_TIME", "IN_PROGRESS")).toEqual({
      fromStatus: "IN_PROGRESS",
      patch: {
        status: "PENDING",
        completedAt: null,
      },
    });
  });

  it("no modifica la Task global de una REUSABLE", () => {
    expect(getTaskRestoreAfterPlanItem("REUSABLE", "COMPLETED")).toBeNull();
  });
});
