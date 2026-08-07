import Link from "next/link";
import { notFound } from "next/navigation";

import { getDailyPlanItemReschedule } from "@/modules/daily-plan/domain/get-daily-plan-item-reschedule";
import { findDailyPlanItemForReschedule } from "@/modules/daily-plan/infrastructure/daily-plan-repository";
import { RescheduleDailyPlanItemForm } from "@/modules/daily-plan/presentation/reschedule-daily-plan-item-form";
import { formatBoliviaDateTimeInput } from "@/shared/domain/bolivia-date-time";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

type RescheduleDailyPlanItemPageProps = {
  params: Promise<{
    dailyPlanItemId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function RescheduleDailyPlanItemPage({
  params,
}: RescheduleDailyPlanItemPageProps) {
  const { dailyPlanItemId } = await params;
  const userId = await getCurrentDevelopmentUserId();
  const item = await findDailyPlanItemForReschedule(
    userId,
    dailyPlanItemId,
  );

  if (!item || !getDailyPlanItemReschedule(item.status).success) {
    notFound();
  }

  const plannedDateInput = item.plannedDate.toISOString().slice(0, 10);
  const startTimeInput = formatBoliviaDateTimeInput(item.startsAt).slice(11);
  const endTimeInput = formatBoliviaDateTimeInput(item.endsAt).slice(11);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <Link
            href={`/daily-plan?date=${plannedDateInput}`}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Volver al plan diario
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            Reprogramar actividad
          </h1>

          <p className="mt-2 text-slate-600">
            Cambia la fecha, el horario o la nota de esta programación.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <RescheduleDailyPlanItemForm
            item={{
              id: item.id,
              taskTitle: item.task.title,
              plannedDateInput,
              startTimeInput,
              endTimeInput,
              notes: item.notes,
            }}
          />
        </section>
      </div>
    </main>
  );
}
