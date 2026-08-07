"use client";

import { useActionState, useEffect, useRef } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { createTaskAction } from "./create-task-action";

type CategoryOption = {
  id: string;
  name: string;
  color: string | null;
};

type ProjectOption = {
  id: string;
  name: string;
};

type TaskFormProps = {
  categories: CategoryOption[];
  projects: ProjectOption[];
};

export function TaskForm({ categories, projects }: TaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createTaskAction,
    initialActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="task-title"
          className="block text-sm font-medium text-slate-700"
        >
          Título
        </label>

        <input
          id="task-title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="Ejemplo: Preparar práctica de SIS-414"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-slate-700"
        >
          Descripción
        </label>

        <textarea
          id="task-description"
          name="description"
          rows={3}
          maxLength={3000}
          placeholder="Detalles o notas de la tarea"
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-category"
            className="block text-sm font-medium text-slate-700"
          >
            Categoría
          </label>

          <select
            id="task-category"
            name="categoryId"
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sin categoría</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="task-project"
            className="block text-sm font-medium text-slate-700"
          >
            Proyecto
          </label>

          <select
            id="task-project"
            name="projectId"
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sin proyecto</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-kind"
            className="block text-sm font-medium text-slate-700"
          >
            Tipo de tarea
          </label>

          <select
            id="task-kind"
            name="kind"
            defaultValue="ONE_TIME"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
          >
            <option value="ONE_TIME">Una sola vez</option>

            <option value="REUSABLE">Reutilizable</option>
          </select>

          <p className="text-xs text-slate-500">
            Las reutilizables permanecen disponibles después de completar una
            ejecución.
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="task-priority"
            className="block text-sm font-medium text-slate-700"
          >
            Prioridad
          </label>

          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="task-estimated-minutes"
            className="block text-sm font-medium text-slate-700"
          >
            Duración estimada
          </label>

          <input
            id="task-estimated-minutes"
            name="estimatedMinutes"
            type="number"
            min={5}
            max={1440}
            step={5}
            placeholder="Ejemplo: 60 minutos"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="task-due-at"
          className="block text-sm font-medium text-slate-700"
        >
          Fecha y hora límite
        </label>

        <input
          id="task-due-at"
          name="dueAt"
          type="datetime-local"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
        disabled={isPending}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Crear tarea"}
      </button>
    </form>
  );
}
