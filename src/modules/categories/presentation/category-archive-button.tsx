"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { changeCategoryArchiveAction } from "./change-category-archive-action";

type CategoryArchiveButtonProps = {
  categoryId: string;
  isArchived: boolean;
};

export function CategoryArchiveButton({
  categoryId,
  isArchived,
}: CategoryArchiveButtonProps) {
  const [state, formAction, isPending] = useActionState(
    changeCategoryArchiveAction,
    initialActionState,
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="categoryId" value={categoryId} />

        <button
          type="submit"
          name="action"
          value={isArchived ? "RESTORE" : "ARCHIVE"}
          disabled={isPending}
          className={
            isArchived
              ? "rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200 disabled:opacity-50"
              : "rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          }
        >
          {isPending ? "Procesando..." : isArchived ? "Restaurar" : "Archivar"}
        </button>
      </form>

      {state.status === "error" ? (
        <p className="mt-2 text-xs text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
