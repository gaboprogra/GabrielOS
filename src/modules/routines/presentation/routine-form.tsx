"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
  type DayOfWeek,
} from "../domain/routine-schema";
import { createRoutineAction } from "./create-routine-action";
import { updateRoutineAction } from "./update-routine-action";

type ScheduleRow = {
  key: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

type RoutineFormProps = {
  tasks: Array<{ id: string; title: string }>;
  routine?: {
    id: string;
    taskId: string;
    taskTitle: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    schedules: Array<{
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
    }>;
  };
  defaultStartDate: string;
};

export function RoutineForm({ tasks, routine, defaultStartDate }: RoutineFormProps) {
  const action = routine ? updateRoutineAction : createRoutineAction;
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );
  const [nextKey, setNextKey] = useState(routine?.schedules.length ?? 1);
  const [schedules, setSchedules] = useState<ScheduleRow[]>(
    routine?.schedules.map((schedule, index) => ({ key: index, ...schedule })) ??
      [
        {
          key: 0,
          dayOfWeek: "MONDAY",
          startTime: "07:00",
          endTime: "08:00",
        },
      ],
  );

  function addSchedule() {
    const usedDays = new Set(schedules.map((schedule) => schedule.dayOfWeek));
    const nextDay = DAYS_OF_WEEK.find((day) => !usedDays.has(day));
    if (!nextDay) return;

    setSchedules((current) => [
      ...current,
      {
        key: nextKey,
        dayOfWeek: nextDay,
        startTime: "07:00",
        endTime: "08:00",
      },
    ]);
    setNextKey((current) => current + 1);
  }

  return (
    <form action={formAction} className="space-y-5">
      {routine ? <input type="hidden" name="routineId" value={routine.id} /> : null}

      <div className="space-y-2">
        <label htmlFor="routine-task" className="block text-sm font-medium text-slate-700">
          Tarea reutilizable
        </label>
        {routine ? (
          <>
            <input type="hidden" name="taskId" value={routine.taskId} />
            <input
              id="routine-task"
              value={routine.taskTitle}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700"
            />
          </>
        ) : (
          <select
            id="routine-task"
            name="taskId"
            required
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
          >
            <option value="" disabled>Selecciona una tarea</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="block">Fecha inicial</span>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={routine?.startDate ?? defaultStartDate}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span className="block">Fecha final (opcional)</span>
          <input
            type="date"
            name="endDate"
            defaultValue={routine?.endDate ?? ""}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={routine?.isActive ?? true}
          className="h-4 w-4 rounded border-slate-300"
        />
        Rutina activa
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Horarios</legend>
        {schedules.map((schedule) => (
          <div key={schedule.key} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_120px_120px_auto]">
            <select
              name="dayOfWeek"
              value={schedule.dayOfWeek}
              onChange={(event) =>
                setSchedules((current) =>
                  current.map((row) =>
                    row.key === schedule.key
                      ? { ...row, dayOfWeek: event.target.value as DayOfWeek }
                      : row,
                  ),
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>{DAY_OF_WEEK_LABELS[day]}</option>
              ))}
            </select>
            <input type="time" name="startTime" required defaultValue={schedule.startTime} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-950" />
            <input type="time" name="endTime" required defaultValue={schedule.endTime} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-950" />
            <button
              type="button"
              disabled={schedules.length === 1}
              onClick={() => setSchedules((current) => current.filter((row) => row.key !== schedule.key))}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSchedule}
          disabled={schedules.length === DAYS_OF_WEEK.length}
          className="text-sm font-medium text-blue-700 hover:underline disabled:text-slate-400"
        >
          + Agregar horario
        </button>
      </fieldset>

      {state.message ? (
        <p className={state.status === "error" ? "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? "Guardando..." : routine ? "Guardar cambios" : "Crear rutina"}
        </button>
        {routine ? (
          <Link href="/routines" className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
