import Link from "next/link";

import type { DashboardItem } from "@/modules/dashboard/domain/dashboard-metrics";

const timeFormatter = new Intl.DateTimeFormat("es-BO", {
  timeZone: "America/La_Paz",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type NextActivityCardProps = {
  activity: DashboardItem | null;
  today: string;
};

export function NextActivityCard({ activity, today }: NextActivityCardProps) {
  const dailyPlanHref = `/daily-plan?date=${today}`;

  if (!activity) {
    return (
      <section aria-labelledby="now-title" className="ui-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id="now-title" className="text-lg font-semibold text-[var(--foreground)]">
            Ahora
          </h2>
          <Link href={dailyPlanHref} className="ui-button-ghost text-sm">
            Ver plan diario →
          </Link>
        </div>
        <div className="ui-empty mt-4 p-5 text-sm">
          No quedan actividades programadas para hoy.
        </div>
      </section>
    );
  }

  const isInProgress = activity.status === "IN_PROGRESS";

  return (
    <section aria-labelledby="now-title" className="ui-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="now-title" className="text-lg font-semibold text-[var(--foreground)]">
          {isInProgress ? "Ahora" : "Próxima actividad"}
        </h2>
        <Link href={dailyPlanHref} className="ui-button-ghost text-sm">
          Ver plan diario →
        </Link>
      </div>

      <div className="mt-5 flex min-w-0 gap-4">
        <span
          aria-hidden="true"
          className="mt-1 block h-12 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: activity.task.category?.color ?? "var(--muted)" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${isInProgress ? "ui-action-warning" : "ui-action-primary"} rounded-full px-2.5 py-1 text-xs font-semibold`}
            >
              {isInProgress ? "En curso" : "Planificada"}
            </span>
            <span className="text-sm font-medium text-[var(--foreground-secondary)]">
              {timeFormatter.format(activity.startsAt)}–{timeFormatter.format(activity.endsAt)}
            </span>
          </div>
          <h3 className="mt-3 truncate text-xl font-semibold text-[var(--foreground)]">
            {activity.task.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--foreground-secondary)]">
            {activity.task.category ? (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                {activity.task.category.name}
              </span>
            ) : null}
            {activity.task.project ? (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                {activity.task.project.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
