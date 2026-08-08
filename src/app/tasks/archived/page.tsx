import Link from "next/link";

import { listArchivedTasks } from "@/modules/tasks/infrastructure/task-repository";
import { TaskStatusActions } from "@/modules/tasks/presentation/task-status-actions";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

export const dynamic = "force-dynamic";

export default async function ArchivedTasksPage() {
  const userId = await getCurrentDevelopmentUserId();
  const archivedTasks = await listArchivedTasks(userId);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/tasks" className="text-blue-700 hover:underline">
              ← Banco de tareas
            </Link>

            <Link href="/daily-plan" className="text-blue-700 hover:underline">
              Plan diario
            </Link>
          </nav>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Tareas archivadas
              </h1>

              <p className="mt-2 text-slate-600">
                Puedes restaurarlas y volverán al estado pendiente.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {archivedTasks.length}
            </span>
          </div>
        </header>

        <section className="ui-card p-6">
          {archivedTasks.length === 0 ? (
            <p className="ui-empty px-5 py-8 text-center text-sm">
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
                      <h2 className="font-medium text-slate-800">
                        {task.title}
                      </h2>

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
    </main>
  );
}
