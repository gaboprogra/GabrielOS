import {
  humanizeDuration,
  type CategoryActivity,
  type ProjectActivity,
} from "@/modules/dashboard/domain/dashboard-metrics";

export function WeeklyStatusSummary({
  completed,
  skipped,
  cancelled,
  inProgress,
}: {
  completed: number;
  skipped: number;
  cancelled: number;
  inProgress: number;
}) {
  const rows = [
    { label: "Completadas", value: completed, className: "ui-action-success" },
    { label: "Omitidas", value: skipped, className: "ui-action-violet" },
    { label: "Canceladas", value: cancelled, className: "ui-action-secondary" },
    ...(inProgress > 0
      ? [{ label: "En curso", value: inProgress, className: "ui-action-warning" }]
      : []),
  ];

  return (
    <section aria-labelledby="status-title" className="ui-card p-5 sm:p-6">
      <h2 id="status-title" className="text-lg font-semibold text-[var(--foreground)]">
        Resumen semanal
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {rows.map((row) => (
          <div key={row.label} className={`${row.className} rounded-xl p-3`}>
            <p className="text-xl font-bold">{row.value}</p>
            <p className="mt-1 text-xs font-medium">{row.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryActivityList({ items }: { items: CategoryActivity[] }) {
  const maxMinutes = items[0]?.completedMinutes ?? 0;

  return (
    <section aria-labelledby="categories-title" className="ui-card p-5 sm:p-6">
      <h2 id="categories-title" className="text-lg font-semibold text-[var(--foreground)]">
        Tiempo completado por categoría
      </h2>
      {items.length === 0 ? (
        <div className="ui-empty mt-4 p-5 text-sm">
          Aún no hay actividades completadas esta semana.
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.id ?? "uncategorized"}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 font-medium text-[var(--foreground)]">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color ?? "var(--muted)" }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 text-[var(--foreground-secondary)]">
                  {humanizeDuration(item.completedMinutes)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${maxMinutes === 0 ? 0 : (item.completedMinutes / maxMinutes) * 100}%`,
                    backgroundColor: item.color ?? "var(--muted)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ProjectActivityList({ items }: { items: ProjectActivity[] }) {
  return (
    <section aria-labelledby="projects-title" className="ui-card p-5 sm:p-6">
      <h2 id="projects-title" className="text-lg font-semibold text-[var(--foreground)]">
        Actividad por proyecto
      </h2>
      {items.length === 0 ? (
        <div className="ui-empty mt-4 p-5 text-sm">
          No hay actividad completada asociada a proyectos esta semana.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-1">
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--foreground)]">{item.name}</p>
                <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                  {item.completedCount} {item.completedCount === 1 ? "actividad" : "actividades"}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-[var(--primary)]">
                {humanizeDuration(item.completedMinutes)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
