import Link from "next/link";
import { notFound } from "next/navigation";

import {
  findRoutineForEdit,
  listRoutineTaskOptions,
} from "@/modules/routines/infrastructure/routine-repository";
import { RoutineForm } from "@/modules/routines/presentation/routine-form";
import { formatDateInput } from "@/shared/domain/date-input";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

export const dynamic = "force-dynamic";

export default async function EditRoutinePage(props: {
  params: Promise<{ routineId: string }>;
}) {
  const { routineId } = await props.params;
  const userId = await getCurrentDevelopmentUserId();
  const [routine, tasks] = await Promise.all([
    findRoutineForEdit(userId, routineId),
    listRoutineTaskOptions(userId),
  ]);

  if (!routine) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link href="/routines" className="text-sm font-medium text-blue-700 hover:underline">← Volver a rutinas</Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Editar rutina</h1>
          <p className="mt-2 text-slate-600">Los cambios permanentes se aplican solo a ocurrencias futuras planificadas dentro de la ventana activa.</p>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <RoutineForm
            tasks={tasks}
            defaultStartDate={formatDateInput(routine.startDate)}
            routine={{
              id: routine.id,
              taskId: routine.taskId,
              taskTitle: routine.task.title,
              startDate: formatDateInput(routine.startDate),
              endDate: routine.endDate ? formatDateInput(routine.endDate) : "",
              isActive: routine.isActive,
              schedules: routine.schedules,
            }}
          />
        </section>
      </div>
    </main>
  );
}
