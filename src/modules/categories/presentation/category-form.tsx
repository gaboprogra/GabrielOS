"use client";

import { useActionState, useEffect, useRef } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { createCategoryAction } from "./create-category-action";

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
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
          htmlFor="category-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre
        </label>

        <input
          id="category-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={50}
          placeholder="Ejemplo: Universidad"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category-color"
          className="block text-sm font-medium text-slate-700"
        >
          Color
        </label>

        <div className="flex items-center gap-3">
          <input
            id="category-color"
            name="color"
            type="color"
            defaultValue="#2563EB"
            className="h-12 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
          />

          <span className="text-sm text-slate-500">
            Se utilizará para identificar la categoría.
          </span>
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
        className="ui-button-primary w-full disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Crear categoría"}
      </button>
    </form>
  );
}
