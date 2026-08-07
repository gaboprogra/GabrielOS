"use client";

import Link from "next/link";
import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { updateTaskAction } from "./update-task-action";

type CategoryOption = {
  id: string;
  name: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

type EditableTask = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  projectId: string | null;
  kind: "ONE_TIME" | "REUSABLE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAtInput: string;
  estimatedMinutes: number | null;
  status: string;
};

type EditTaskFormProps = {
  task: EditableTask;
  categories: CategoryOption[];
  projects: ProjectOption[];
};

export function EditTaskForm({
  task,
  categories,
  projects,
}: EditTaskFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateTaskAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="taskId" value={task.id} />

      <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        Estado actual: <strong className="text-slate-800">{task.status}</strong>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-task-title"
          className="block text-sm font-medium text-slate-700"
        >
          Título
        </label>

        <input
          id="edit-task-title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={200}
          defaultValue={task.title}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-task-description"
          className="block text-sm font-medium text-slate-700"
        >
          Descripción
        </label>

        <textarea
          id="edit-task-description"
          name="description"
          rows={4}
          maxLength={3000}
          defaultValue={task.description ?? ""}
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="edit-task-category"
            className="block text-sm font-medium text-slate-700"
          >
            Categoría
          </label>

          <select
            id="edit-task-category"
            name="categoryId"
            defaultValue={task.categoryId ?? ""}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
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
            htmlFor="edit-task-project"
            className="block text-sm font-medium text-slate-700"
          >
            Proyecto
          </label>

          <select
            id="edit-task-project"
            name="projectId"
            defaultValue={task.projectId ?? ""}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
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
            htmlFor="edit-task-priority"
            className="block text-sm font-medium text-slate-700"
          >
            Prioridad
          </label>

          <select
            id="edit-task-priority"
            name="priority"
            defaultValue={task.priority}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-task-duration"
            className="block text-sm font-medium text-slate-700"
          >
            Duración estimada
          </label>

          <input
            id="edit-task-duration"
            name="estimatedMinutes"
            type="number"
            min={5}
            max={1440}
            step={5}
            defaultValue={task.estimatedMinutes ?? undefined}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-task-due-at"
          className="block text-sm font-medium text-slate-700"
        >
          Fecha y hora límite
        </label>

        <input
          id="edit-task-due-at"
          name="dueAt"
          type="datetime-local"
          defaultValue={task.dueAtInput}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="edit-task-kind"
          className="block text-sm font-medium text-slate-700"
        >
          Tipo de tarea
        </label>

        <select
          id="edit-task-kind"
          name="kind"
          defaultValue={task.kind}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
        >
          <option value="ONE_TIME">Una sola vez</option>

          <option value="REUSABLE">Reutilizable</option>
        </select>
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

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>

        <Link
          href="/tasks"
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Volver sin guardar
        </Link>
      </div>
    </form>
  );
}
