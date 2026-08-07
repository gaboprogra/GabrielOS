import Link from "next/link";

import { listActiveCategories } from "@/modules/categories/infrastructure/category-repository";
import { listActiveProjectOptions } from "@/modules/projects/infrastructure/project-repository";
import {
  countArchivedTasks,
  listActiveTasks,
  listRecentArchivedTasks,
} from "@/modules/tasks/infrastructure/task-repository";
import { TaskForm } from "@/modules/tasks/presentation/task-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";
import { TaskStatusActions } from "@/modules/tasks/presentation/task-status-actions";

export const dynamic = "force-dynamic";

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  ARCHIVED: "Archivada",
};

function formatDueAt(date: Date | null): string {
  if (!date) {
    return "Sin fecha límite";
  }

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(date);
}

export default async function TasksPage() {
  const userId = await getCurrentDevelopmentUserId();

  const [categories, projects, tasks, archivedTasks, archivedTaskCount] =
    await Promise.all([
      listActiveCategories(userId),
      listActiveProjectOptions(userId),
      listActiveTasks(userId),
      listRecentArchivedTasks(userId),
      countArchivedTasks(userId),
    ]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-blue-700 hover:underline">
              ← Inicio
            </Link>

            <Link href="/categories" className="text-blue-700 hover:underline">
              Categorías
            </Link>

            <Link href="/projects" className="text-blue-700 hover:underline">
              Proyectos
            </Link>
            <Link href="/daily-plan" className="text-blue-700 hover:underline">
              Plan diario
            </Link>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Banco de tareas
          </h1>

          <p className="mt-2 text-slate-600">
            Registra todo lo que necesitas hacer. Más adelante podrás llevar
            estas tareas al plan diario.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
          <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-950">
              Nueva tarea
            </h2>

            <TaskForm categories={categories} projects={projects} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950">
                Tareas registradas
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {tasks.length}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
                <p className="font-medium text-slate-700">
                  Todavía no existen tareas.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Crea la primera utilizando el formulario.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-950">
                            {task.title}
                          </h3>

                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="text-sm font-medium text-blue-700 hover:underline"
                          >
                            Editar
                          </Link>
                        </div>

                        {task.description ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {task.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {statusLabels[task.status] ?? task.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        Prioridad:{" "}
                        {priorityLabels[task.priority] ?? task.priority}
                      </span>

                      {task.category ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: task.category.color ?? "#64748B",
                            }}
                          />

                          {task.category.name}
                        </span>
                      ) : null}

                      {task.project ? (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                          {task.project.name}
                        </span>
                      ) : null}
                    </div>

                    <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                      <TaskStatusActions
                        taskId={task.id}
                        status={task.status}
                        kind={task.kind}
                      />
                      <div>
                        <dt className="text-slate-500">Fecha límite</dt>
                        <dd className="font-medium text-slate-800">
                          {formatDueAt(task.dueAt)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-slate-500">Duración estimada</dt>
                        <dd className="font-medium text-slate-800">
                          {task.estimatedMinutes
                            ? `${task.estimatedMinutes} minutos`
                            : "Sin estimación"}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Tareas archivadas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Puedes restaurarlas y volverán al estado pendiente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/tasks/archived"
                  className="text-sm font-medium text-blue-700 hover:underline"
                >
                  Ver todas las archivadas
                </Link>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  {archivedTaskCount}
                </span>
              </div>
            </div>

            {archivedTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                No existen tareas archivadas.
              </p>
            ) : (
              <ul className="space-y-3">
                {archivedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-slate-800">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Archivada
                          {task.archivedAt
                            ? ` el ${new Intl.DateTimeFormat("es-BO", {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: "America/La_Paz",
                              }).format(task.archivedAt)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <TaskStatusActions
                      taskId={task.id}
                      status={task.status}
                      kind={task.kind}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
