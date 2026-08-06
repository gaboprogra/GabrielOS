"use client";

import { useActionState, useEffect, useRef } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { createProjectAction } from "./create-project-action";

export function ProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createProjectAction,
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
          htmlFor="project-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre
        </label>

        <input
          id="project-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder="Ejemplo: GabrielOS"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="project-description"
          className="block text-sm font-medium text-slate-700"
        >
          Descripción
        </label>

        <textarea
          id="project-description"
          name="description"
          rows={4}
          maxLength={1000}
          placeholder="¿Qué quieres lograr con este proyecto?"
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="project-start-date"
            className="block text-sm font-medium text-slate-700"
          >
            Fecha de inicio
          </label>

          <input
            id="project-start-date"
            name="startDate"
            type="date"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="project-due-date"
            className="block text-sm font-medium text-slate-700"
          >
            Fecha límite
          </label>

          <input
            id="project-due-date"
            name="dueDate"
            type="date"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
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
        {isPending ? "Guardando..." : "Crear proyecto"}
      </button>
    </form>
  );
}
