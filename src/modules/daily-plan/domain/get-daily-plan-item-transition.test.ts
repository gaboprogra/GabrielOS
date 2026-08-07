import { describe, expect, it } from "vitest";

import { getDailyPlanItemTransition } from "./get-daily-plan-item-transition";

const now = new Date("2026-08-07T05:00:00.000Z");

describe("getDailyPlanItemTransition", () => {
  it("inicia una actividad programada", () => {
    const result = getDailyPlanItemTransition("PLANNED", "START", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("IN_PROGRESS");
    }
  });

  it("completa una actividad en progreso", () => {
    const result = getDailyPlanItemTransition("IN_PROGRESS", "COMPLETE", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("COMPLETED");
      expect(result.patch.completedAt).toBe(now);
    }
  });

  it("omite una actividad programada", () => {
    const result = getDailyPlanItemTransition("PLANNED", "SKIP", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("SKIPPED");
    }
  });

  it("rechaza iniciar una actividad completada", () => {
    const result = getDailyPlanItemTransition("COMPLETED", "START", now);

    expect(result.success).toBe(false);
  });
});
