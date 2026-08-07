import { describe, expect, it } from "vitest";

import { getDailyPlanItemRemoval } from "./get-daily-plan-item-removal";

describe("getDailyPlanItemRemoval", () => {
  it.each(["PLANNED", "IN_PROGRESS", "SKIPPED", "CANCELLED"] as const)(
    "permite quitar una actividad %s",
    (status) => {
      const result = getDailyPlanItemRemoval(status, "REUSABLE", "PENDING");

      expect(result.success).toBe(true);
    },
  );

  it("rechaza quitar una actividad completada", () => {
    const result = getDailyPlanItemRemoval(
      "COMPLETED",
      "ONE_TIME",
      "COMPLETED",
    );

    expect(result).toEqual({
      success: false,
      error: "Una actividad completada no puede quitarse del plan.",
    });
  });

  it("devuelve a pendiente una tarea ONE_TIME iniciada", () => {
    const result = getDailyPlanItemRemoval(
      "IN_PROGRESS",
      "ONE_TIME",
      "IN_PROGRESS",
    );

    expect(result).toEqual({
      success: true,
      resetTaskToPending: true,
    });
  });

  it("mantiene disponible una tarea REUSABLE al quitar su ejecución", () => {
    const result = getDailyPlanItemRemoval(
      "IN_PROGRESS",
      "REUSABLE",
      "PENDING",
    );

    expect(result).toEqual({
      success: true,
      resetTaskToPending: false,
    });
  });
});
