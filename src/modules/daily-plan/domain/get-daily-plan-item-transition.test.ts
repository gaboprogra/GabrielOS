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

  it.each(["IN_PROGRESS", "COMPLETED", "SKIPPED", "CANCELLED"] as const)(
    "permite volver %s a PLANNED y limpia timestamps",
    (status) => {
      const result = getDailyPlanItemTransition(
        status,
        "RESTORE_TO_PLANNED",
        now,
      );

      expect(result).toEqual({
        success: true,
        patch: {
          status: "PLANNED",
          completedAt: null,
          skippedAt: null,
          cancelledAt: null,
        },
        historyAction: "STATUS_CHANGED",
      });
    },
  );

  it("rechaza restaurar una actividad que ya está PLANNED", () => {
    expect(
      getDailyPlanItemTransition("PLANNED", "RESTORE_TO_PLANNED", now)
        .success,
    ).toBe(false);
  });

  it("restaurar conserva programación e identidad de una ocurrencia de rutina", () => {
    const item = {
      id: "plan-item-1",
      routineScheduleId: "routine-schedule-1",
      routineOccurrenceDate: "2026-08-08",
      isRoutineException: true,
      plannedDate: "2026-08-08",
      startsAt: "19:00",
      endsAt: "20:00",
      status: "COMPLETED" as const,
    };
    const result = getDailyPlanItemTransition(
      item.status,
      "RESTORE_TO_PLANNED",
      now,
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect({ ...item, ...result.patch }).toMatchObject({
        id: "plan-item-1",
        routineScheduleId: "routine-schedule-1",
        routineOccurrenceDate: "2026-08-08",
        isRoutineException: true,
        plannedDate: "2026-08-08",
        startsAt: "19:00",
        endsAt: "20:00",
        status: "PLANNED",
      });
    }
  });
});
