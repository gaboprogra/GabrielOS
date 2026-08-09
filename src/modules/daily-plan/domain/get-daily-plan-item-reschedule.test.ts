import { describe, expect, it } from "vitest";

import { getDailyPlanItemReschedule } from "./get-daily-plan-item-reschedule";

describe("getDailyPlanItemReschedule", () => {
  it("permite reprogramar una actividad PLANNED", () => {
    expect(getDailyPlanItemReschedule("PLANNED").success).toBe(true);
  });

  it("permite reprogramar IN_PROGRESS y la devuelve a PLANNED", () => {
    const result = getDailyPlanItemReschedule("IN_PROGRESS");

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch).toEqual({
        status: "PLANNED",
        completedAt: null,
        skippedAt: null,
        cancelledAt: null,
      });
    }
  });

  it.each(["COMPLETED", "CANCELLED", "SKIPPED"] as const)(
    "rechaza reprogramar una actividad %s",
    (status) => {
      expect(getDailyPlanItemReschedule(status)).toEqual({
        success: false,
        error: "Esta actividad ya no puede reprogramarse.",
      });
    },
  );
});
