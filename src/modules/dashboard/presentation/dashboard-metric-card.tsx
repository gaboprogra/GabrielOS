type DashboardMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function DashboardMetricCard({
  label,
  value,
  detail,
}: DashboardMetricCardProps) {
  return (
    <article className="ui-card min-w-0 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">{detail}</p>
      ) : null}
    </article>
  );
}
