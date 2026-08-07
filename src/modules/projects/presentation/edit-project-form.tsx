"use client";

import Link from "next/link";
import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { updateProjectAction } from "./update-project-action";

type EditProjectFormProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    dueDate: string;
    status: string;
  };
};

export function EditProjectForm({ project }: EditProjectFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProjectAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={project.id} />

      <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm">
        Estado: <strong>{project.status}</strong>
      </p>

      <div className="space-y-2">
        <label
          htmlFor="edit-project-name"
          className="block text-sm font-medium"
        >
          Nombre
        </label>

        <input
          id="edit-project-name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={project.name}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-project-description"
          className="block text-sm font-medium"
        >
          Descripción
        </label>

        <textarea
          id="edit-project-description"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={project.description ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="startDate"
          type="date"
          defaultValue={project.startDate}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          name="dueDate"
          type="date"
          defaultValue={project.dueDate}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-sm text-green-700"
              : "text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>

        <Link
          href="/projects"
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
        >
          Volver
        </Link>
      </div>
    </form>
  );
}
