"use client";

import Link from "next/link";
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
        className: "ui-action-warning",
      },
      {
        action: "COMPLETE",
        label: "Completar",
        className: "ui-action-success",
      },
      {
        action: "SKIP",
        label: "Omitir",
        className: "ui-action-violet",
      },
      {
        action: "CANCEL",
        label: "Cancelar",
        className: "ui-action-secondary",
      },
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "ui-action-danger",
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
        action: "SKIP",
        label: "Omitir",
        className: "ui-action-violet",
      },
      {
        action: "CANCEL",
        label: "Cancelar",
        className: "ui-action-secondary",
      },
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "ui-action-danger",
      },
    ];
  }

  if (status === "SKIPPED" || status === "CANCELLED") {
    return [
      {
        action: "REMOVE",
        label: "Quitar del plan",
        className: "ui-action-danger",
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
      <div className="flex flex-wrap gap-2">
        {status === "PLANNED" ? (
          <Link
            href={`/daily-plan/${dailyPlanItemId}/edit`}
            className="ui-action-primary rounded-lg px-3 py-2 text-sm font-medium transition"
          >
            Reprogramar
          </Link>
        ) : null}

        <form action={formAction} className="flex flex-wrap gap-2">
          <input
            type="hidden"
            name="dailyPlanItemId"
            value={dailyPlanItemId}
          />

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
      </div>

      {state.status === "error" ? (
        <p className="mt-2 text-sm text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
