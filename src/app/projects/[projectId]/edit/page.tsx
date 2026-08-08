import Link from "next/link";
import { notFound } from "next/navigation";

import { findProjectForEdit } from "@/modules/projects/infrastructure/project-repository";
import { EditProjectForm } from "@/modules/projects/presentation/edit-project-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

type EditProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function formatDateInput(date: Date | null): string {
  return date?.toISOString().slice(0, 10) ?? "";
}

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { projectId } = await params;
  const userId = await getCurrentDevelopmentUserId();

  const project = await findProjectForEdit(userId, projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/projects" className="text-sm font-medium text-blue-700">
          ← Volver a proyectos
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Editar proyecto</h1>

        <section className="ui-card mt-8 p-6">
          <EditProjectForm
            project={{
              id: project.id,
              name: project.name,
              description: project.description,
              startDate: formatDateInput(project.startDate),
              dueDate: formatDateInput(project.dueDate),
              status: project.status,
            }}
          />
        </section>
      </div>
    </main>
  );
}
