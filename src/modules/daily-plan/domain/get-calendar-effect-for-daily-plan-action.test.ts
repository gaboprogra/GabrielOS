import { describe, expect, it } from "vitest";

import { getCalendarEffectForDailyPlanAction } from "./get-calendar-effect-for-daily-plan-action";

describe("getCalendarEffectForDailyPlanAction", () => {
  it.each(["COMPLETE", "SKIP", "CANCEL", "REMOVE"] as const)(
    "requiere eliminar Calendar para %s",
    (action) => {
      expect(getCalendarEffectForDailyPlanAction(action)).toBe("DELETE");
    },
  );

  it("mantiene el evento al iniciar", () => {
    expect(getCalendarEffectForDailyPlanAction("START")).toBe("KEEP");
  });

  it("asegura un evento al restaurar", () => {
    expect(getCalendarEffectForDailyPlanAction("RESTORE_TO_PLANNED")).toBe(
      "ENSURE",
    );
  });
});
