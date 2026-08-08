import Link from "next/link";

import {
  listRoutines,
  listRoutineTaskOptions,
} from "@/modules/routines/infrastructure/routine-repository";
import {
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
} from "@/modules/routines/domain/routine-schema";
import { RoutineActiveAction } from "@/modules/routines/presentation/routine-active-action";
import { RoutineForm } from "@/modules/routines/presentation/routine-form";
import { formatBoliviaDateInput } from "@/shared/domain/bolivia-date-time";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "Sin fecha final";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export default async function RoutinesPage() {
  const userId = await getCurrentDevelopmentUserId();
  const [routines, tasks] = await Promise.all([
    listRoutines(userId),
    listRoutineTaskOptions(userId),
  ]);
  const activeRoutines = routines.filter((routine) => routine.isActive);
  const inactiveRoutines = routines.filter((routine) => !routine.isActive);

  function renderRoutine(routine: (typeof routines)[number]) {
    const schedules = [...routine.schedules].sort(
      (left, right) =>
        DAYS_OF_WEEK.indexOf(left.dayOfWeek) -
        DAYS_OF_WEEK.indexOf(right.dayOfWeek),
    );

    return (
      <li key={routine.id} className="rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-slate-950">{routine.task.title}</h3>
              <Link href={`/routines/${routine.id}/edit`} className="text-sm font-medium text-blue-700 hover:underline">
                Editar
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {formatDate(routine.startDate)} — {formatDate(routine.endDate)}
            </p>
            {routine.task.status === "ARCHIVED" ? (
              <p className="mt-2 text-sm text-amber-700">La tarea está archivada; no se generarán nuevas ocurrencias.</p>
            ) : null}
          </div>
          <span className={routine.isActive ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"}>
            {routine.isActive ? "Activa" : "Inactiva"}
          </span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]} {schedule.startTime}–{schedule.endTime}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <RoutineActiveAction routineId={routine.id} isActive={routine.isActive} />
        </div>
      </li>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-blue-700 hover:underline">← Inicio</Link>
            <Link href="/daily-plan" className="text-blue-700 hover:underline">Plan diario</Link>
            <Link href="/tasks" className="text-blue-700 hover:underline">Banco de tareas</Link>
          </nav>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Rutinas</h1>
          <p className="mt-2 text-slate-600">Programa ejecuciones recurrentes de tareas reutilizables.</p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
          <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-950">Nueva rutina</h2>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                Crea primero una tarea reutilizable no archivada.
              </p>
            ) : (
              <RoutineForm tasks={tasks} defaultStartDate={formatBoliviaDateInput(new Date())} />
            )}
          </section>

          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">Rutinas activas</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{activeRoutines.length}</span>
              </div>
              {activeRoutines.length ? <ul className="space-y-4">{activeRoutines.map(renderRoutine)}</ul> : <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No hay rutinas activas.</p>}
            </section>

            {inactiveRoutines.length ? (
              <details className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer text-xl font-semibold text-slate-950">Rutinas inactivas ({inactiveRoutines.length})</summary>
                <ul className="mt-5 space-y-4">{inactiveRoutines.map(renderRoutine)}</ul>
              </details>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
