import { describe, expect, it } from "vitest";

import { getDailyPlanItemReschedule } from "./get-daily-plan-item-reschedule";

describe("getDailyPlanItemReschedule", () => {
  it("permite reprogramar una actividad PLANNED", () => {
    expect(getDailyPlanItemReschedule("PLANNED")).toEqual({ success: true });
  });

  it.each(["IN_PROGRESS", "COMPLETED", "CANCELLED", "SKIPPED"] as const)(
    "rechaza reprogramar una actividad %s",
    (status) => {
      expect(getDailyPlanItemReschedule(status)).toEqual({
        success: false,
        error: "Solo una actividad programada puede reprogramarse.",
      });
    },
  );
});
