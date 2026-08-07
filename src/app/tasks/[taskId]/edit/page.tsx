import Link from "next/link";
import { notFound } from "next/navigation";

import { listActiveCategories } from "@/modules/categories/infrastructure/category-repository";
import { listActiveProjectOptions } from "@/modules/projects/infrastructure/project-repository";
import { findTaskForEdit } from "@/modules/tasks/infrastructure/task-repository";
import { EditTaskForm } from "@/modules/tasks/presentation/edit-task-form";
import { formatBoliviaDateTimeInput } from "@/shared/domain/bolivia-date-time";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

type EditTaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { taskId } = await params;
  const userId = await getCurrentDevelopmentUserId();

  const [task, categories, projects] = await Promise.all([
    findTaskForEdit(userId, taskId),
    listActiveCategories(userId),
    listActiveProjectOptions(userId),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href="/tasks"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Volver al banco de tareas
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            Editar tarea
          </h1>

          <p className="mt-2 text-slate-600">
            Actualiza los datos de la tarea sin perder su historial.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <EditTaskForm
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              categoryId: task.categoryId,
              projectId: task.projectId,
              priority: task.priority,
              dueAtInput: formatBoliviaDateTimeInput(task.dueAt),
              estimatedMinutes: task.estimatedMinutes,
              status: task.status,
            }}
            categories={categories}
            projects={projects}
          />
        </section>
      </div>
    </main>
  );
}
