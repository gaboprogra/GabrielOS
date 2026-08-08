"use client";

import Link from "next/link";
import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { rescheduleDailyPlanItemAction } from "./reschedule-daily-plan-item-action";

type RescheduleDailyPlanItemFormProps = {
  item: {
    id: string;
    taskTitle: string;
    plannedDateInput: string;
    startTimeInput: string;
    endTimeInput: string;
    notes: string | null;
  };
};

export function RescheduleDailyPlanItemForm({
  item,
}: RescheduleDailyPlanItemFormProps) {
  const [state, formAction, isPending] = useActionState(
    rescheduleDailyPlanItemAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="dailyPlanItemId" value={item.id} />

      <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        Actividad: <strong className="text-slate-800">{item.taskTitle}</strong>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reschedule-plan-date"
          className="block text-sm font-medium text-slate-700"
        >
          Día
        </label>

        <input
          id="reschedule-plan-date"
          name="plannedDate"
          type="date"
          required
          defaultValue={item.plannedDateInput}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="reschedule-plan-start-time"
            className="block text-sm font-medium text-slate-700"
          >
            Hora inicial
          </label>

          <input
            id="reschedule-plan-start-time"
            name="startTime"
            type="time"
            required
            defaultValue={item.startTimeInput}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reschedule-plan-end-time"
            className="block text-sm font-medium text-slate-700"
          >
            Hora final
          </label>

          <input
            id="reschedule-plan-end-time"
            name="endTime"
            type="time"
            required
            defaultValue={item.endTimeInput}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reschedule-plan-notes"
          className="block text-sm font-medium text-slate-700"
        >
          Nota del plan
        </label>

        <textarea
          id="reschedule-plan-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          defaultValue={item.notes ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>

      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="ui-button-primary disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>

        <Link
          href={`/daily-plan?date=${item.plannedDateInput}`}
          className="ui-button-secondary"
        >
          Volver sin guardar
        </Link>
      </div>
    </form>
  );
}
