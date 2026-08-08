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
              ? "ui-action-primary rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
              : "ui-action-secondary rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
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
