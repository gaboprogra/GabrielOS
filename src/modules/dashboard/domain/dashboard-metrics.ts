import { formatBoliviaDateInput } from "@/shared/domain/bolivia-date-time";
import { addDaysToDateInput } from "@/shared/domain/date-input";

export type DashboardItemStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED";

export type DashboardItem = {
  id: string;
  plannedDate: string;
  startsAt: Date;
  endsAt: Date;
  status: DashboardItemStatus;
  task: {
    id: string;
    title: string;
    category: {
      id: string;
      name: string;
      color: string | null;
    } | null;
    project: {
      id: string;
      name: string;
    } | null;
  };
};

export type CompletionSummary = {
  completed: number;
  eligible: number;
  percentage: number | null;
};

export type WeeklyCompletionDay = CompletionSummary & {
  date: string;
};

export type CategoryActivity = {
  id: string | null;
  name: string;
  color: string | null;
  completedMinutes: number;
};

export type ProjectActivity = {
  id: string;
  name: string;
  completedCount: number;
  completedMinutes: number;
};

const ELIGIBLE_STATUSES = new Set<DashboardItemStatus>([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
]);

export function isEligibleDashboardItem(status: DashboardItemStatus): boolean {
  return ELIGIBLE_STATUSES.has(status);
}

export function durationMinutes(startsAt: Date, endsAt: Date): number {
  return Math.max(0, Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000));
}

export function humanizeDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

export function calculateCompletion(
  items: ReadonlyArray<Pick<DashboardItem, "status">>,
): CompletionSummary {
  const eligibleItems = items.filter((item) => isEligibleDashboardItem(item.status));
  const completed = eligibleItems.filter((item) => item.status === "COMPLETED").length;
  const eligible = eligibleItems.length;

  return {
    completed,
    eligible,
    percentage: eligible === 0 ? null : Math.round((completed / eligible) * 100),
  };
}

export function calculatePlannedMinutes(items: ReadonlyArray<DashboardItem>): number {
  return items
    .filter((item) => isEligibleDashboardItem(item.status))
    .reduce(
      (total, item) => total + durationMinutes(item.startsAt, item.endsAt),
      0,
    );
}

export function calculateCompletedMinutes(items: ReadonlyArray<DashboardItem>): number {
  return items
    .filter((item) => item.status === "COMPLETED")
    .reduce(
      (total, item) => total + durationMinutes(item.startsAt, item.endsAt),
      0,
    );
}

export function buildWeeklyCompletion(
  dates: ReadonlyArray<string>,
  items: ReadonlyArray<DashboardItem>,
): WeeklyCompletionDay[] {
  return dates.map((date) => ({
    date,
    ...calculateCompletion(items.filter((item) => item.plannedDate === date)),
  }));
}

export function groupCompletedByCategory(
  items: ReadonlyArray<DashboardItem>,
  limit = 5,
): CategoryActivity[] {
  const groups = new Map<string, CategoryActivity>();

  for (const item of items) {
    if (item.status !== "COMPLETED") {
      continue;
    }

    const key = item.task.category?.id ?? "__uncategorized__";
    const current = groups.get(key) ?? {
      id: item.task.category?.id ?? null,
      name: item.task.category?.name ?? "Sin categoría",
      color: item.task.category?.color ?? null,
      completedMinutes: 0,
    };

    current.completedMinutes += durationMinutes(item.startsAt, item.endsAt);
    groups.set(key, current);
  }

  return [...groups.values()]
    .sort((left, right) => right.completedMinutes - left.completedMinutes)
    .slice(0, limit);
}

export function groupCompletedByProject(
  items: ReadonlyArray<DashboardItem>,
  limit = 5,
): ProjectActivity[] {
  const groups = new Map<string, ProjectActivity>();

  for (const item of items) {
    if (item.status !== "COMPLETED" || !item.task.project) {
      continue;
    }

    const current = groups.get(item.task.project.id) ?? {
      id: item.task.project.id,
      name: item.task.project.name,
      completedCount: 0,
      completedMinutes: 0,
    };

    current.completedCount += 1;
    current.completedMinutes += durationMinutes(item.startsAt, item.endsAt);
    groups.set(item.task.project.id, current);
  }

  return [...groups.values()]
    .sort((left, right) => right.completedMinutes - left.completedMinutes)
    .slice(0, limit);
}

export function findCurrentOrNextActivity(
  items: ReadonlyArray<DashboardItem>,
  now: Date,
): DashboardItem | null {
  const byStartTime = (left: DashboardItem, right: DashboardItem) =>
    left.startsAt.getTime() - right.startsAt.getTime();
  const inProgress = items
    .filter((item) => item.status === "IN_PROGRESS")
    .sort(byStartTime)[0];

  if (inProgress) {
    return inProgress;
  }

  return (
    items
      .filter(
        (item) => item.status === "PLANNED" && item.endsAt.getTime() > now.getTime(),
      )
      .sort(byStartTime)[0] ?? null
  );
}

export function getDashboardDateRange(now: Date) {
  const endDate = formatBoliviaDateInput(now);
  const startDate = addDaysToDateInput(endDate, -6);

  return {
    startDate,
    endDate,
    dates: Array.from({ length: 7 }, (_, index) =>
      addDaysToDateInput(startDate, index),
    ),
  };
}

export function getGreeting(now: Date): "Buenos días" | "Buenas tardes" | "Buenas noches" {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/La_Paz",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );

  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }

  if (hour >= 12 && hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}
