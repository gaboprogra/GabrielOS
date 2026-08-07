import type {
  DailyPlanItemAction,
  DailyPlanItemStatus,
} from "./daily-plan-item-status";

type HistoryAction = "STATUS_CHANGED" | "COMPLETED" | "SKIPPED" | "CANCELLED";

type DailyPlanItemPatch = {
  status: DailyPlanItemStatus;
  completedAt?: Date | null;
  skippedAt?: Date | null;
  cancelledAt?: Date | null;
};

export type DailyPlanItemTransitionResult =
  | {
      success: true;
      patch: DailyPlanItemPatch;
      historyAction: HistoryAction;
    }
  | {
      success: false;
      error: string;
    };

export function getDailyPlanItemTransition(
  currentStatus: DailyPlanItemStatus,
  action: DailyPlanItemAction,
  now: Date,
): DailyPlanItemTransitionResult {
  if (action === "START") {
    if (currentStatus !== "PLANNED") {
      return {
        success: false,
        error: "Solo una actividad programada puede iniciarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "IN_PROGRESS",
      },
      historyAction: "STATUS_CHANGED",
    };
  }

  if (action === "COMPLETE") {
    if (currentStatus !== "PLANNED" && currentStatus !== "IN_PROGRESS") {
      return {
        success: false,
        error: "Esta actividad ya no puede completarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "COMPLETED",
        completedAt: now,
        skippedAt: null,
        cancelledAt: null,
      },
      historyAction: "COMPLETED",
    };
  }

  if (action === "SKIP") {
    if (currentStatus !== "PLANNED" && currentStatus !== "IN_PROGRESS") {
      return {
        success: false,
        error: "Esta actividad ya no puede omitirse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "SKIPPED",
        completedAt: null,
        skippedAt: now,
        cancelledAt: null,
      },
      historyAction: "SKIPPED",
    };
  }

  if (action === "CANCEL") {
    if (currentStatus !== "PLANNED" && currentStatus !== "IN_PROGRESS") {
      return {
        success: false,
        error: "Esta actividad ya no puede cancelarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "CANCELLED",
        completedAt: null,
        skippedAt: null,
        cancelledAt: now,
      },
      historyAction: "CANCELLED",
    };
  }

  return {
    success: false,
    error: "La acción solicitada no es válida.",
  };
}
