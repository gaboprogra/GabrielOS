"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import type { TaskStatus, TaskStatusAction } from "../domain/task";
import { changeTaskStatusAction } from "./change-task-status-action";
import type { TaskKind } from "../domain/task-kind";

type TaskStatusActionsProps = {
  taskId: string;
  status: TaskStatus;
  kind: TaskKind;
};

type ActionButton = {
  action: TaskStatusAction;
  label: string;
  className: string;
};

function getAvailableActions(
  status: TaskStatus,
  kind: TaskKind,
): ActionButton[] {
  if (status === "PENDING") {
    return [
      {
        action: "START",
        label: "Iniciar",
        className: "ui-action-warning",
      },
      {
        action: "COMPLETE",
        label: "Completar",
        className: "ui-action-success",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "ui-action-secondary",
      },
    ];
  }

  if (status === "IN_PROGRESS") {
    return [
      {
        action: "COMPLETE",
        label: "Completar",
        className: "ui-action-success",
      },
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "ui-action-secondary",
      },
    ];
  }

  if (status === "COMPLETED") {
    return [
      {
        action: "ARCHIVE",
        label: "Archivar",
        className: "ui-action-secondary",
      },
    ];
  }

  return [
    {
      action: "RESTORE",
      label: "Restaurar",
      className: "ui-action-primary",
    },
  ];
}

export function TaskStatusActions({
  taskId,
  status,
  kind,
}: TaskStatusActionsProps) {
  const [state, formAction, isPending] = useActionState(
    changeTaskStatusAction,
    initialActionState,
  );

  const actions = getAvailableActions(status, kind);

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
