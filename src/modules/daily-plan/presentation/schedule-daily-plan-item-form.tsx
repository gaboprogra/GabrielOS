"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { scheduleDailyPlanItemAction } from "./schedule-daily-plan-item-action";

type TaskOption = {
  id: string;
  title: string;
  priority: string;
  estimatedMinutes: number | null;
  category: {
    name: string;
  } | null;
  project: {
    name: string;
  } | null;
};

type ScheduleDailyPlanItemFormProps = {
  tasks: TaskOption[];
  defaultDate: string;
};

export function ScheduleDailyPlanItemForm({
  tasks,
  defaultDate,
}: ScheduleDailyPlanItemFormProps) {
  const [state, formAction, isPending] = useActionState(
    scheduleDailyPlanItemAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="plan-task"
          className="block text-sm font-medium text-slate-700"
        >
          Tarea
        </label>

        <select
          id="plan-task"
          name="taskId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
        >
          <option value="" disabled>
            Selecciona una tarea
          </option>

          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
              {task.project ? ` — ${task.project.name}` : ""}
              {task.estimatedMinutes ? ` (${task.estimatedMinutes} min)` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="plan-date"
          className="block text-sm font-medium text-slate-700"
        >
          Día
        </label>

        <input
          id="plan-date"
          name="plannedDate"
          type="date"
          required
          defaultValue={defaultDate}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="plan-start-time"
            className="block text-sm font-medium text-slate-700"
          >
            Hora inicial
          </label>

          <input
            id="plan-start-time"
            name="startTime"
            type="time"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="plan-end-time"
            className="block text-sm font-medium text-slate-700"
          >
            Hora final
          </label>

          <input
            id="plan-end-time"
            name="endTime"
            type="time"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="plan-notes"
          className="block text-sm font-medium text-slate-700"
        >
          Nota del plan
        </label>

        <textarea
          id="plan-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          placeholder="Ejemplo: terminar primero la validación"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "success"
              ? "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || tasks.length === 0}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Programando..." : "Agregar al plan diario"}
      </button>
    </form>
  );
}
