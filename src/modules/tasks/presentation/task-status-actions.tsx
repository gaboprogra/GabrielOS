"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import type { TaskStatus, TaskStatusAction } from "../domain/task";
import { changeTaskStatusAction } from "./change-task-status-action";

type TaskStatusActionsProps = {
  taskId: string;
  status: TaskStatus;
};

type ActionButton = {
  action: TaskStatusAction;
  label: string;
  className: string;
};

function getAvailableActions(status: TaskStatus): ActionButton[] {
  if (status === "PENDING") {
    return [
      {
        action: "START",
        label: "Iniciar",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      },
      {
        action: "COMPLETE",
        label: "Completar",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
    ];
  }

  if (status === "IN_PROGRESS") {
    return [
      {
        action: "COMPLETE",
        label: "Completar",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
    ];
  }

  if (status === "COMPLETED") {
    return [
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
    ];
  }

  return [
    {
      action: "RESTORE",
      label: "Restaurar",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
  ];
}

export function TaskStatusActions({ taskId, status }: TaskStatusActionsProps) {
  const [state, formAction, isPending] = useActionState(
    changeTaskStatusAction,
    initialActionState,
  );

  const actions = getAvailableActions(status);

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="taskId" value={taskId} />

        {actions.map((item) => (
          <button
            key={item.action}
            type="submit"
            name="action"
            value={item.action}
            disabled={isPending}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${item.className}`}
          >
            {isPending ? "Procesando..." : item.label}
          </button>
        ))}
      </form>

      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "mt-3 text-sm text-red-700"
              : "mt-3 text-sm text-green-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
