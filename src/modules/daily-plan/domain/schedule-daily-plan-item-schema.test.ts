import { describe, expect, it } from "vitest";

import { scheduleDailyPlanItemSchema } from "./schedule-daily-plan-item-schema";

describe("scheduleDailyPlanItemSchema", () => {
  it("acepta una programación válida", () => {
    const result = scheduleDailyPlanItemSchema.safeParse({
      taskId: "task-id",
      plannedDate: "2026-08-07",
      startTime: "19:00",
      endTime: "21:00",
      notes: "",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una hora final anterior", () => {
    const result = scheduleDailyPlanItemSchema.safeParse({
      taskId: "task-id",
      plannedDate: "2026-08-07",
      startTime: "21:00",
      endTime: "19:00",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una fecha inexistente", () => {
    const result = scheduleDailyPlanItemSchema.safeParse({
      taskId: "task-id",
      plannedDate: "2026-02-30",
      startTime: "19:00",
      endTime: "21:00",
      notes: "",
    });

    expect(result.success).toBe(false);
  });
});
