import Link from "next/link";

import { listDailyPlanItemsByDate } from "@/modules/daily-plan/infrastructure/daily-plan-repository";
import { ScheduleDailyPlanItemForm } from "@/modules/daily-plan/presentation/schedule-daily-plan-item-form";
import { listSchedulableTaskOptions } from "@/modules/tasks/infrastructure/task-repository";
import { formatBoliviaDateInput } from "@/shared/domain/bolivia-date-time";
import { addDaysToDateInput, parseDateInput } from "@/shared/domain/date-input";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";
import { DailyPlanItemActions } from "@/modules/daily-plan/presentation/daily-plan-item-actions";

export const dynamic = "force-dynamic";

type DailyPlanPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

const statusLabels: Record<string, string> = {
  PLANNED: "Programada",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  SKIPPED: "Omitida",
  CANCELLED: "Cancelada",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/La_Paz",
  }).format(date);
}

function formatSelectedDate(date: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getDurationMinutes(startsAt: Date, endsAt: Date): number {
  return Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
}
function getStatusClassName(status: string): string {
  const classes: Record<string, string> = {
    PLANNED: "ui-action-primary",
    IN_PROGRESS: "ui-action-warning",
    COMPLETED: "ui-action-success",
    SKIPPED: "ui-action-violet",
    CANCELLED: "ui-action-secondary",
  };

  return classes[status] ?? "ui-action-secondary";
}

export default async function DailyPlanPage({
  searchParams,
}: DailyPlanPageProps) {
  const userId = await getCurrentDevelopmentUserId();

  const params = await searchParams;

  const today = formatBoliviaDateInput(new Date());

  const requestedDate = typeof params?.date === "string" ? params.date : today;

  const selectedDate = parseDateInput(requestedDate) ?? parseDateInput(today);

  if (!selectedDate) {
    throw new Error("No se pudo determinar la fecha del plan diario.");
  }

  const selectedDateInput = selectedDate.toISOString().slice(0, 10);

  const previousDate = addDaysToDateInput(selectedDateInput, -1);

  const nextDate = addDaysToDateInput(selectedDateInput, 1);

  const [tasks, planItems] = await Promise.all([
    listSchedulableTaskOptions(userId),
    listDailyPlanItemsByDate(userId, selectedDate),
  ]);

  const completedCount = planItems.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  const pendingCount = planItems.filter(
    (item) => item.status === "PLANNED" || item.status === "IN_PROGRESS",
  ).length;

  const totalMinutes = planItems
    .filter((item) => item.status !== "CANCELLED" && item.status !== "SKIPPED")
    .reduce(
      (total, item) => total + getDurationMinutes(item.startsAt, item.endsAt),
      0,
    );

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-blue-700 hover:underline">
              ← Inicio
            </Link>

            <Link href="/tasks" className="text-blue-700 hover:underline">
              Banco de tareas
            </Link>

            <Link href="/projects" className="text-blue-700 hover:underline">
              Proyectos
            </Link>

            <Link href="/routines" className="text-blue-700 hover:underline">
              Rutinas
            </Link>
          </nav>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Plan diario</h1>

              <p className="mt-2 capitalize text-slate-600">
                {formatSelectedDate(selectedDate)}
              </p>
            </div>

            <Link
              href={`/daily-plan?date=${today}`}
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Hoy
            </Link>
          </div>
        </header>

        <section className="day-navigation ui-card mb-8 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/daily-plan?date=${previousDate}`}
              className="ui-button-secondary"
            >
              ← Día anterior
            </Link>

            <form
              method="GET"
              action="/daily-plan"
              className="flex items-center gap-2"
            >
              <input
                key={selectedDateInput}
                type="date"
                name="date"
                defaultValue={selectedDateInput}
                className="rounded-xl border border-slate-300 px-4 py-2 text-slate-900"
              />

              <button
                type="submit"
                className="ui-button-primary"
              >
                Ir
              </button>
            </form>

            <Link
              href={`/daily-plan?date=${nextDate}`}
              className="ui-button-secondary"
            >
              Día siguiente →
            </Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="stat-card ui-card p-5">
            <p className="text-sm text-slate-500">Actividades</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {planItems.length}
            </p>
          </div>

          <div className="stat-card ui-card p-5">
            <p className="text-sm text-slate-500">Pendientes</p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingCount}
            </p>
          </div>

          <div className="stat-card ui-card p-5">
            <p className="text-sm text-slate-500">Completadas</p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {completedCount}
            </p>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
          <section className="ui-card p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Agenda</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {totalMinutes > 0
                    ? `${totalMinutes} minutos programados`
                    : "Sin tiempo programado"}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {planItems.length}
              </span>
            </div>

            {planItems.length === 0 ? (
              <div className="ui-empty px-6 py-16 text-center">
                <p className="font-medium text-slate-700">
                  No tienes actividades programadas para este día.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Utiliza el formulario para agregar una tarea.
                </p>
              </div>
            ) : (
              <ol className="space-y-4">
                {planItems.map((item) => (
                  <li
                    key={item.id}
                    className="activity-card rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="min-w-24">
                          <p className="font-semibold text-slate-950">
                            {formatTime(item.startsAt)}
                          </p>

                          <p className="text-sm text-slate-500">
                            {formatTime(item.endsAt)}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-950">
                            {item.task.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {getDurationMinutes(item.startsAt, item.endsAt)}{" "}
                            minutos
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClassName(
                          item.status,
                        )}`}
                      >
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        Prioridad:{" "}
                        {priorityLabels[item.task.priority] ??
                          item.task.priority}
                      </span>

                      {item.task.category ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                item.task.category.color ?? "#64748B",
                            }}
                          />

                          {item.task.category.name}
                        </span>
                      ) : null}

                      {item.task.project ? (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                          {item.task.project.name}
                        </span>
                      ) : null}
                    </div>

                    {item.notes ? (
                      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Nota
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {item.notes}
                        </p>
                      </div>
                    ) : null}
                    <DailyPlanItemActions
                      dailyPlanItemId={item.id}
                      status={item.status}
                    />
                  </li>
                ))}
              </ol>
            )}
          </section>

          <aside className="ui-card self-start p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              Programar tarea
            </h2>

            <p className="mb-5 mt-1 text-sm text-slate-500">
              Agrega una actividad al día seleccionado.
            </p>

            {tasks.length === 0 ? (
              <div className="ui-empty p-6 text-center">
                <p className="font-medium text-slate-700">
                  No tienes tareas disponibles.
                </p>

                <Link
                  href="/tasks"
                  className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
                >
                  Ir al banco de tareas
                </Link>
              </div>
            ) : (
              <ScheduleDailyPlanItemForm
                tasks={tasks}
                defaultDate={selectedDateInput}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
