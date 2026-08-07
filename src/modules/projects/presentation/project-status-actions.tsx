"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import type {
  ProjectStatus,
  ProjectStatusAction,
} from "../domain/project-status";
import { changeProjectStatusAction } from "./change-project-status-action";

type ProjectStatusActionsProps = {
  projectId: string;
  status: ProjectStatus;
};

type ActionButton = {
  action: ProjectStatusAction;
  label: string;
};

function getActions(status: ProjectStatus): ActionButton[] {
  if (status === "ACTIVE") {
    return [
      {
        action: "COMPLETE",
        label: "Completar",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
      },
    ];
  }

  if (status === "COMPLETED") {
    return [
      {
        action: "REOPEN",
        label: "Reabrir",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
      },
    ];
  }

  return [
    {
      action: "RESTORE",
      label: "Restaurar",
    },
  ];
}

export function ProjectStatusActions({
  projectId,
  status,
}: ProjectStatusActionsProps) {
  const [state, formAction, isPending] = useActionState(
    changeProjectStatusAction,
    initialActionState,
  );

  return (
    <div className="mt-4">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="projectId" value={projectId} />

        {getActions(status).map((item) => (
          <button
            key={item.action}
            type="submit"
            name="action"
            value={item.action}
            disabled={isPending}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            {isPending ? "Procesando..." : item.label}
          </button>
        ))}
      </form>

      {state.status === "error" ? (
        <p className="mt-2 text-xs text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
