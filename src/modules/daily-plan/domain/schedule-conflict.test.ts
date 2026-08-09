import { describe, expect, it } from "vitest";

import {
  findScheduleConflict,
  type BlockingScheduleItem,
} from "./schedule-conflict";

function time(value: string): Date {
  return new Date(`2026-08-08T${value}:00.000-04:00`);
}

function item(
  id: string,
  startsAt: string,
  endsAt: string,
): BlockingScheduleItem {
  return {
    id,
    title: `Actividad ${id}`,
    startsAt: time(startsAt),
    endsAt: time(endsAt),
  };
}

describe("findScheduleConflict", () => {
  it("mantiene la duración y salta varios bloques consecutivos", () => {
    const result = findScheduleConflict({
      startsAt: time("17:30"),
      endsAt: time("18:30"),
      latestEnd: time("23:59"),
      blockingItems: [
        item("first", "17:00", "18:00"),
        item("second", "18:00", "19:00"),
      ],
    });

    expect(result?.requestedDurationMinutes).toBe(60);
    expect(result?.suggestedSlot).toEqual({
      startsAt: time("19:00"),
      endsAt: time("20:00"),
    });
  });

  it("no propone un horario que todavía se solapa", () => {
    const result = findScheduleConflict({
      startsAt: time("10:30"),
      endsAt: time("11:30"),
      latestEnd: time("23:59"),
      blockingItems: [
        item("a", "10:00", "11:00"),
        item("b", "11:15", "12:15"),
      ],
    });

    expect(result?.suggestedSlot).toEqual({
      startsAt: time("12:15"),
      endsAt: time("13:15"),
    });
  });

  it("no propone un horario que cruce al día siguiente", () => {
    const result = findScheduleConflict({
      startsAt: time("22:30"),
      endsAt: time("23:30"),
      latestEnd: time("23:59"),
      blockingItems: [item("late", "22:00", "23:15")],
    });

    expect(result?.suggestedSlot).toBeNull();
  });

  it("excluye el propio DailyPlanItem al reprogramar", () => {
    const result = findScheduleConflict({
      startsAt: time("19:30"),
      endsAt: time("20:30"),
      latestEnd: time("23:59"),
      blockingItems: [item("self", "19:00", "20:00")],
      excludedItemId: "self",
    });

    expect(result).toBeNull();
  });
});
