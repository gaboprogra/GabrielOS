"use client";

import { useActionState } from "react";

import { initialActionState } from "@/shared/application/action-state";

import { changeRoutineActiveAction } from "./change-routine-active-action";

export function RoutineActiveAction(props: {
  routineId: string;
  isActive: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    changeRoutineActiveAction,
    initialActionState,
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="routineId" value={props.routineId} />
        <input
          type="hidden"
          name="isActive"
          value={props.isActive ? "false" : "true"}
        />
        <button
          type="submit"
          disabled={isPending}
          className="ui-action-secondary rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending
            ? "Procesando..."
            : props.isActive
              ? "Desactivar"
              : "Activar"}
        </button>
      </form>
      {state.status === "error" ? (
        <p className="mt-2 text-sm text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
