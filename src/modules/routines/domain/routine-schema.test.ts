import { describe, expect, it } from "vitest";

import { routineDataSchema } from "./routine-schema";

const validRoutine = {
  taskId: "task-id",
  startDate: "2026-08-10",
  endDate: "2026-09-30",
  isActive: true,
  schedules: [
    { dayOfWeek: "MONDAY", startTime: "07:00", endTime: "08:00" },
  ],
} as const;

describe("routineDataSchema", () => {
  it("acepta horarios independientes por día", () => {
    const result = routineDataSchema.safeParse({
      ...validRoutine,
      schedules: [
        { dayOfWeek: "MONDAY", startTime: "07:00", endTime: "08:00" },
        {
          dayOfWeek: "WEDNESDAY",
          startTime: "19:00",
          endTime: "20:00",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rechaza endDate anterior a startDate", () => {
    const result = routineDataSchema.safeParse({
      ...validRoutine,
      endDate: "2026-08-09",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una hora final anterior o igual", () => {
    const result = routineDataSchema.safeParse({
      ...validRoutine,
      schedules: [
        { dayOfWeek: "MONDAY", startTime: "08:00", endTime: "08:00" },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rechaza días repetidos", () => {
    const result = routineDataSchema.safeParse({
      ...validRoutine,
      schedules: [
        { dayOfWeek: "MONDAY", startTime: "07:00", endTime: "08:00" },
        { dayOfWeek: "MONDAY", startTime: "18:00", endTime: "19:00" },
      ],
    });

    expect(result.success).toBe(false);
  });
});
