import Link from "next/link";

import { listProjects } from "@/modules/projects/infrastructure/project-repository";
import { ProjectForm } from "@/modules/projects/presentation/project-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

export const dynamic = "force-dynamic";

function formatProjectDate(date: Date | null): string {
  if (!date) {
    return "Sin definir";
  }

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    ARCHIVED: "Archivado",
  };

  return labels[status] ?? status;
}

export default async function ProjectsPage() {
  const userId = await getCurrentDevelopmentUserId();
  const projects = await listProjects(userId);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-blue-700 hover:underline">
              ← Inicio
            </Link>

            <Link href="/categories" className="text-blue-700 hover:underline">
              Categorías
            </Link>
          </nav>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Proyectos
          </h1>

          <p className="mt-2 text-slate-600">
            Agrupa tareas relacionadas con un objetivo concreto.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-950">
              Nuevo proyecto
            </h2>

            <ProjectForm />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                Proyectos registrados
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {projects.length}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
                <p className="font-medium text-slate-700">
                  Todavía no existen proyectos.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Crea el primero utilizando el formulario.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {project.name}
                        </h3>

                        {project.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {project.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Inicio</dt>
                        <dd className="font-medium text-slate-800">
                          {formatProjectDate(project.startDate)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-slate-500">Fecha límite</dt>
                        <dd className="font-medium text-slate-800">
                          {formatProjectDate(project.dueDate)}
                        </dd>
                      </div>
                    </dl>
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
