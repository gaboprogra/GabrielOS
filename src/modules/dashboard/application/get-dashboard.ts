import {
  buildWeeklyCompletion,
  calculateCompletedMinutes,
  calculateCompletion,
  calculatePlannedMinutes,
  findCurrentOrNextActivity,
  getDashboardDateRange,
  getGreeting,
  groupCompletedByCategory,
  groupCompletedByProject,
  type DashboardItem,
} from "@/modules/dashboard/domain/dashboard-metrics";
import { getDashboardSource } from "@/modules/dashboard/infrastructure/dashboard-repository";
import { parseDateInput } from "@/shared/domain/date-input";

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export async function getDashboard(userId: string, now = new Date()) {
  const range = getDashboardDateRange(now);
  const startDate = parseDateInput(range.startDate);
  const endDate = parseDateInput(range.endDate);

  if (!startDate || !endDate) {
    throw new Error("No se pudo calcular el rango del dashboard.");
  }

  const { user, dailyPlanItems } = await getDashboardSource(
    userId,
    startDate,
    endDate,
  );

  const items: DashboardItem[] = dailyPlanItems.map((item) => ({
    id: item.id,
    plannedDate: item.plannedDate.toISOString().slice(0, 10),
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    status: item.status,
    task: item.task,
  }));
  const todayItems = items.filter(
    (item) => item.plannedDate === range.endDate,
  );
  const todayCompletion = calculateCompletion(todayItems);

  return {
    userName: user.name,
    greeting: getGreeting(now),
    today: range.endDate,
    todayMetrics: {
      completed: todayCompletion.completed,
      eligible: todayCompletion.eligible,
      completionPercentage: todayCompletion.percentage,
      plannedMinutes: calculatePlannedMinutes(todayItems),
      completedMinutes: calculateCompletedMinutes(todayItems),
    },
    currentOrNextActivity: findCurrentOrNextActivity(todayItems, now),
    weeklyCompletion: buildWeeklyCompletion(range.dates, items),
    weeklyStatuses: {
      completed: items.filter((item) => item.status === "COMPLETED").length,
      skipped: items.filter((item) => item.status === "SKIPPED").length,
      cancelled: items.filter((item) => item.status === "CANCELLED").length,
      inProgress: todayItems.filter((item) => item.status === "IN_PROGRESS").length,
    },
    categories: groupCompletedByCategory(items),
    projects: groupCompletedByProject(items),
  };
}
