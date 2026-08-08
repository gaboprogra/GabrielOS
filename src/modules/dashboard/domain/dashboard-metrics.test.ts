import { describe, expect, it } from "vitest";

import {
  buildWeeklyCompletion,
  calculateCompletedMinutes,
  calculateCompletion,
  calculatePlannedMinutes,
  getDashboardDateRange,
  getGreeting,
  groupCompletedByCategory,
  humanizeDuration,
  type DashboardItem,
  type DashboardItemStatus,
} from "./dashboard-metrics";

function createItem(input: {
  id: string;
  date?: string;
  status: DashboardItemStatus;
  start?: string;
  end?: string;
  category?: DashboardItem["task"]["category"];
}): DashboardItem {
  const date = input.date ?? "2026-08-07";

  return {
    id: input.id,
    plannedDate: date,
    startsAt: new Date(`${date}T${input.start ?? "10:00"}:00.000-04:00`),
    endsAt: new Date(`${date}T${input.end ?? "11:00"}:00.000-04:00`),
    status: input.status,
    task: {
      id: `task-${input.id}`,
      title: `Actividad ${input.id}`,
      category: input.category ?? null,
      project: null,
    },
  };
}

describe("dashboard metrics", () => {
  it("calcula 4/6 cuando hay cuatro completadas, una planificada y una omitida", () => {
    const statuses: DashboardItemStatus[] = [
      "COMPLETED",
      "COMPLETED",
      "COMPLETED",
      "COMPLETED",
      "PLANNED",
      "SKIPPED",
    ];

    expect(calculateCompletion(statuses.map((status) => ({ status })))).toEqual({
      completed: 4,
      eligible: 6,
      percentage: 67,
    });
  });

  it("excluye CANCELLED del denominador", () => {
    expect(
      calculateCompletion([
        { status: "COMPLETED" },
        { status: "PLANNED" },
        { status: "CANCELLED" },
      ]),
    ).toEqual({ completed: 1, eligible: 2, percentage: 50 });
  });

  it("devuelve null cuando no existe plan elegible", () => {
    expect(calculateCompletion([]).percentage).toBeNull();
    expect(calculateCompletion([{ status: "CANCELLED" }]).percentage).toBeNull();
  });

  it("separa el tiempo planificado elegible del tiempo completado", () => {
    const items = [
      createItem({ id: "completed", status: "COMPLETED", end: "11:30" }),
      createItem({ id: "planned", status: "PLANNED", start: "12:00", end: "12:45" }),
      createItem({ id: "cancelled", status: "CANCELLED", start: "13:00", end: "15:00" }),
    ];

    expect(calculatePlannedMinutes(items)).toBe(135);
    expect(calculateCompletedMinutes(items)).toBe(90);
    expect(humanizeDuration(135)).toBe("2 h 15 min");
  });

  it("conserva días sin plan como porcentaje null en la semana", () => {
    const week = buildWeeklyCompletion(
      ["2026-08-05", "2026-08-06", "2026-08-07"],
      [createItem({ id: "only-day", date: "2026-08-06", status: "PLANNED" })],
    );

    expect(week.map((day) => day.percentage)).toEqual([null, 0, null]);
  });

  it("agrupa ejecuciones sin Category como Sin categoría", () => {
    const groups = groupCompletedByCategory([
      createItem({ id: "uncategorized", status: "COMPLETED" }),
    ]);

    expect(groups).toEqual([
      {
        id: null,
        name: "Sin categoría",
        color: null,
        completedMinutes: 60,
      },
    ]);
  });

  it("calcula el rango y saludo usando America/La_Paz", () => {
    const now = new Date("2026-08-08T02:30:00.000Z");

    expect(getDashboardDateRange(now)).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-07",
      dates: [
        "2026-08-01",
        "2026-08-02",
        "2026-08-03",
        "2026-08-04",
        "2026-08-05",
        "2026-08-06",
        "2026-08-07",
      ],
    });
    expect(getGreeting(now)).toBe("Buenas noches");
  });
});
