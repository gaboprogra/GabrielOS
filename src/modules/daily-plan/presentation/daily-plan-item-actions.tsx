"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import type {
  DailyPlanItemAction,
  DailyPlanItemStatus,
} from "../domain/daily-plan-item-status";

import { changeDailyPlanItemStatusAction } from "./change-daily-plan-item-status-action";

type DailyPlanItemActionsProps = {
  dailyPlanItemId: string;
  status: DailyPlanItemStatus;
};

type ActionDefinition = {
  action: DailyPlanItemAction;
  label: string;
  className: string;
};

function getAvailableActions(status: DailyPlanItemStatus): ActionDefinition[] {
  if (status === "PLANNED") {
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
        action: "SKIP",
        label: "Omitir",
        className: "bg-violet-100 text-violet-800 hover:bg-violet-200",
      },
      {
        action: "CANCEL",
        label: "Cancelar",
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "bg-red-50 text-red-700 hover:bg-red-100",
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
        action: "SKIP",
        label: "Omitir",
        className: "bg-violet-100 text-violet-800 hover:bg-violet-200",
      },
      {
        action: "CANCEL",
        label: "Cancelar",
        className: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "bg-red-50 text-red-700 hover:bg-red-100",
      },
    ];
  }

  if (status === "SKIPPED" || status === "CANCELLED") {
    return [
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "bg-red-50 text-red-700 hover:bg-red-100",
      },
    ];
  }

  return [];
}

export function DailyPlanItemActions({
  dailyPlanItemId,
  status,
}: DailyPlanItemActionsProps) {
  const [state, formAction, isPending] = useActionState(
    changeDailyPlanItemStatusAction,
    initialActionState,
  );

  const actions = getAvailableActions(status);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="dailyPlanItemId" value={dailyPlanItemId} />

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

      {state.status === "error" ? (
        <p className="mt-2 text-sm text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
