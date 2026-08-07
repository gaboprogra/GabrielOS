"use client";

import Link from "next/link";
import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { updateCategoryAction } from "./update-category-action";

type EditCategoryFormProps = {
  category: {
    id: string;
    name: string;
    color: string | null;
  };
};

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateCategoryAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="categoryId" value={category.id} />

      <div className="space-y-2">
        <label
          htmlFor="edit-category-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre
        </label>

        <input
          id="edit-category-name"
          name="name"
          required
          minLength={2}
          maxLength={50}
          defaultValue={category.name}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-category-color"
          className="block text-sm font-medium text-slate-700"
        >
          Color
        </label>

        <input
          id="edit-category-color"
          name="color"
          type="color"
          defaultValue={category.color ?? "#2563EB"}
          className="h-12 w-20 rounded-lg border border-slate-300 bg-white p-1"
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

      <div className="flex gap-3">
        <button
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>

        <Link
          href="/categories"
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
        >
          Volver
        </Link>
      </div>
    </form>
  );
}
