import { getDashboard } from "@/modules/dashboard/application/get-dashboard";
import { humanizeDuration } from "@/modules/dashboard/domain/dashboard-metrics";
import {
  CategoryActivityList,
  ProjectActivityList,
  WeeklyStatusSummary,
} from "@/modules/dashboard/presentation/dashboard-activity-lists";
import { DashboardMetricCard } from "@/modules/dashboard/presentation/dashboard-metric-card";
import { NextActivityCard } from "@/modules/dashboard/presentation/next-activity-card";
import { WeeklyCompletionChart } from "@/modules/dashboard/presentation/weekly-completion-chart";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";
import { parseDateInput } from "@/shared/domain/date-input";

export const dynamic = "force-dynamic";

const readableDateFormatter = new Intl.DateTimeFormat("es-BO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function Home() {
  const userId = await getCurrentDevelopmentUserId();
  const dashboard = await getDashboard(userId);
  const today = parseDateInput(dashboard.today);
  const readableDate = today
    ? capitalize(readableDateFormatter.format(today))
    : dashboard.today;
  const { todayMetrics } = dashboard;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 sm:mb-8">
          <p className="text-sm font-semibold text-[var(--primary)]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {dashboard.greeting}, {dashboard.userName}
          </h1>
          <p className="mt-1 text-sm capitalize text-[var(--foreground-secondary)] sm:text-base">
            {readableDate}
          </p>
        </header>

        <section aria-labelledby="today-title">
          <h2 id="today-title" className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            Hoy
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
            <DashboardMetricCard
              label="Actividades"
              value={
                todayMetrics.eligible === 0
                  ? "Sin plan"
                  : `${todayMetrics.completed} / ${todayMetrics.eligible}`
              }
              detail={todayMetrics.eligible === 0 ? undefined : "completadas"}
            />
            <DashboardMetricCard
              label="Cumplimiento"
              value={
                todayMetrics.completionPercentage === null
                  ? "—"
                  : `${todayMetrics.completionPercentage}%`
              }
              detail={todayMetrics.completionPercentage === null ? "Sin plan" : undefined}
            />
            <DashboardMetricCard
              label="Tiempo planificado"
              value={humanizeDuration(todayMetrics.plannedMinutes)}
            />
            <DashboardMetricCard
              label="Tiempo completado"
              value={humanizeDuration(todayMetrics.completedMinutes)}
            />
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <NextActivityCard
            activity={dashboard.currentOrNextActivity}
            today={dashboard.today}
          />
          <WeeklyCompletionChart days={dashboard.weeklyCompletion} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <WeeklyStatusSummary {...dashboard.weeklyStatuses} />
          <CategoryActivityList items={dashboard.categories} />
        </div>

        <div className="mt-5">
          <ProjectActivityList items={dashboard.projects} />
        </div>
      </div>
    </main>
  );
}
