import Link from "next/link";

import type { WeeklyCompletionDay } from "@/modules/dashboard/domain/dashboard-metrics";
import { parseDateInput } from "@/shared/domain/date-input";

const weekdayFormatter = new Intl.DateTimeFormat("es-BO", {
  weekday: "short",
  timeZone: "UTC",
});
const dayFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  timeZone: "UTC",
});

type WeeklyCompletionChartProps = {
  days: WeeklyCompletionDay[];
};

export function WeeklyCompletionChart({ days }: WeeklyCompletionChartProps) {
  return (
    <section aria-labelledby="week-title" className="ui-card p-5 sm:p-6">
      <div>
        <h2 id="week-title" className="text-lg font-semibold text-[var(--foreground)]">
          Últimos 7 días
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          Cumplimiento diario del plan
        </p>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-3">
        {days.map((day) => {
          const date = parseDateInput(day.date);
          const percentage = day.percentage;

          if (!date) {
            return null;
          }

          return (
            <Link
              key={day.date}
              href={`/daily-plan?date=${day.date}`}
              className="group flex min-w-0 flex-col items-center rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label={`${weekdayFormatter.format(date)} ${dayFormatter.format(date)}: ${percentage === null ? "sin plan" : `${percentage}% de cumplimiento`}`}
            >
              <span className="text-xs font-semibold capitalize text-[var(--foreground-secondary)]">
                {weekdayFormatter.format(date).replace(".", "")}
              </span>
              <span className="mt-1 text-xs text-[var(--muted)]">
                {dayFormatter.format(date)}
              </span>
              <span className="mt-3 flex h-24 w-full max-w-8 items-end overflow-hidden rounded-full bg-[var(--surface-elevated)] p-1">
                {percentage === null ? null : (
                  <span
                    className="block w-full rounded-full bg-[var(--primary)] transition group-hover:bg-[var(--primary-hover)]"
                    style={{ height: `${Math.max(percentage, 4)}%` }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  />
                )}
              </span>
              <span className="mt-2 text-xs font-semibold text-[var(--foreground)]">
                {percentage === null ? "—" : `${percentage}%`}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
