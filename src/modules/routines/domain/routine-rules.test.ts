import { describe, expect, it } from "vitest";

import {
  calculateRoutineOccurrences,
  canReconcileRoutineOccurrence,
  canTaskUseRoutine,
  getRoutineWindow,
} from "./routine-rules";

describe("routine rules", () => {
  it("acepta solamente tareas REUSABLE no archivadas", () => {
    expect(canTaskUseRoutine("REUSABLE", "PENDING")).toEqual({
      success: true,
    });
    expect(canTaskUseRoutine("ONE_TIME", "PENDING").success).toBe(false);
    expect(canTaskUseRoutine("REUSABLE", "ARCHIVED").success).toBe(false);
  });

  it("calcula la ventana de siete días usando la fecha de Bolivia", () => {
    const window = getRoutineWindow(new Date("2026-08-10T02:00:00.000Z"));

    expect(window).toEqual({
      startDate: "2026-08-09",
      endDate: "2026-08-15",
    });
  });

  it("respeta inicio, fin y días dentro de la ventana", () => {
    const occurrences = calculateRoutineOccurrences({
      windowStartDate: "2026-08-09",
      routineStartDate: "2026-08-10",
      routineEndDate: "2026-08-14",
      schedules: [
        {
          id: "monday",
          dayOfWeek: "MONDAY",
          startTime: "07:00",
          endTime: "08:00",
        },
        {
          id: "wednesday",
          dayOfWeek: "WEDNESDAY",
          startTime: "19:00",
          endTime: "20:00",
        },
        {
          id: "friday",
          dayOfWeek: "FRIDAY",
          startTime: "18:30",
          endTime: "19:30",
        },
      ],
    });

    expect(occurrences.map((occurrence) => occurrence.occurrenceDate)).toEqual([
      "2026-08-10",
      "2026-08-12",
      "2026-08-14",
    ]);
  });

  it("produce como máximo una ocurrencia por día aunque reciba un día repetido", () => {
    const occurrences = calculateRoutineOccurrences({
      windowStartDate: "2026-08-10",
      routineStartDate: "2026-08-10",
      routineEndDate: null,
      schedules: [
        {
          id: "monday-original",
          dayOfWeek: "MONDAY",
          startTime: "07:00",
          endTime: "08:00",
        },
        {
          id: "monday-repeated",
          dayOfWeek: "MONDAY",
          startTime: "19:00",
          endTime: "20:00",
        },
      ],
    });

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]?.routineScheduleId).toBe("monday-repeated");
  });

  it("solo reconcilia PLANNED que no sean excepciones manuales", () => {
    expect(canReconcileRoutineOccurrence("PLANNED", false)).toBe(true);
    expect(canReconcileRoutineOccurrence("PLANNED", true)).toBe(false);
    expect(canReconcileRoutineOccurrence("IN_PROGRESS", false)).toBe(false);
    expect(canReconcileRoutineOccurrence("COMPLETED", false)).toBe(false);
    expect(canReconcileRoutineOccurrence("SKIPPED", false)).toBe(false);
    expect(canReconcileRoutineOccurrence("CANCELLED", false)).toBe(false);
  });
});
