"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import type { SerializedScheduleConflict } from "./daily-plan-form-action-state";

type ScheduleConflictNoticeProps = {
  conflict: SerializedScheduleConflict;
  startInputId: string;
  endInputId: string;
};

export function ScheduleConflictNotice({
  conflict,
  startInputId,
  endInputId,
}: ScheduleConflictNoticeProps) {
  const { pending } = useFormStatus();
  const [dismissedConflict, setDismissedConflict] =
    useState<SerializedScheduleConflict | null>(null);

  if (dismissedConflict === conflict) {
    return null;
  }

  function chooseAnotherTime() {
    setDismissedConflict(conflict);
    document.getElementById(startInputId)?.focus();
  }

  function acceptSuggestedSlot() {
    if (!conflict.suggestedSlot) return;

    const startInput = document.getElementById(startInputId);
    const endInput = document.getElementById(endInputId);

    if (
      !(startInput instanceof HTMLInputElement) ||
      !(endInput instanceof HTMLInputElement)
    ) {
      return;
    }

    startInput.value = conflict.suggestedSlot.startTime;
    endInput.value = conflict.suggestedSlot.endTime;
    startInput.form?.requestSubmit();
  }

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-[var(--warning)] bg-[var(--warning-soft)] p-4"
    >
      <p className="font-semibold text-[var(--foreground)]">
        Ese horario se cruza con:
      </p>
      <div className="mt-3 rounded-lg bg-[var(--surface)] px-3 py-2">
        <p className="font-medium text-[var(--foreground)]">
          {conflict.item.title}
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          {conflict.item.startTime}–{conflict.item.endTime}
        </p>
      </div>

      {conflict.suggestedSlot ? (
        <div className="mt-3">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Siguiente espacio disponible:
          </p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">
            {conflict.suggestedSlot.startTime}–{conflict.suggestedSlot.endTime}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--foreground-secondary)]">
          No queda un espacio suficiente durante este día.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {conflict.suggestedSlot ? (
          <button
            type="button"
            onClick={acceptSuggestedSlot}
            disabled={pending}
            className="ui-button-primary"
          >
            Programar {conflict.suggestedSlot.startTime}–{conflict.suggestedSlot.endTime}
          </button>
        ) : null}
        <button
          type="button"
          onClick={chooseAnotherTime}
          disabled={pending}
          className="ui-button-secondary"
        >
          Elegir otro horario
        </button>
        <button
          type="button"
          onClick={() => setDismissedConflict(conflict)}
          disabled={pending}
          className="ui-button-ghost"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}
