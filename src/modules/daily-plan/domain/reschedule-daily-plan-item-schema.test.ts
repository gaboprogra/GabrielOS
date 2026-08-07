import { describe, expect, it } from "vitest";

import { rescheduleDailyPlanItemSchema } from "./reschedule-daily-plan-item-schema";

describe("rescheduleDailyPlanItemSchema", () => {
  it("acepta una reprogramación válida", () => {
    const result = rescheduleDailyPlanItemSchema.safeParse({
      dailyPlanItemId: "daily-plan-item-id",
      plannedDate: "2026-08-10",
      startTime: "19:30",
      endTime: "20:30",
      notes: "Nuevo horario",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una hora final que no es posterior a la inicial", () => {
    const result = rescheduleDailyPlanItemSchema.safeParse({
      dailyPlanItemId: "daily-plan-item-id",
      plannedDate: "2026-08-10",
      startTime: "20:30",
      endTime: "19:30",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una fecha inexistente", () => {
    const result = rescheduleDailyPlanItemSchema.safeParse({
      dailyPlanItemId: "daily-plan-item-id",
      plannedDate: "2026-02-30",
      startTime: "19:30",
      endTime: "20:30",
      notes: "",
    });

    expect(result.success).toBe(false);
  });
});
