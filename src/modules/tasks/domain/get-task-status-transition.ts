import type { TaskStatus, TaskStatusAction } from "./task";
import type { TaskKind } from "./task-kind";

type HistoryAction = "STATUS_CHANGED" | "COMPLETED" | "ARCHIVED" | "RESTORED";

type TaskStatusPatch = {
  status: TaskStatus;
  completedAt?: Date | null;
  archivedAt?: Date | null;
};

export type TaskStatusTransitionResult =
  | {
      success: true;
      patch: TaskStatusPatch;
      historyAction: HistoryAction;
    }
  | {
      success: false;
      error: string;
    };

export function getTaskStatusTransition(
  currentStatus: TaskStatus,
  action: TaskStatusAction,
  now: Date,
  kind: TaskKind = "ONE_TIME",
): TaskStatusTransitionResult {
  if (kind === "REUSABLE" && (action === "START" || action === "COMPLETE")) {
    return {
      success: false,
      error:
        "Las tareas reutilizables se completan desde una ejecución del plan diario.",
    };
  }
  if (action === "START") {
    if (currentStatus !== "PENDING") {
      return {
        success: false,
        error: "Solo una tarea pendiente puede iniciarse.",
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
    if (currentStatus !== "PENDING" && currentStatus !== "IN_PROGRESS") {
      return {
        success: false,
        error: "Solo una tarea pendiente o en progreso puede completarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "COMPLETED",
        completedAt: now,
        archivedAt: null,
      },
      historyAction: "COMPLETED",
    };
  }

  if (action === "ARCHIVE") {
    if (currentStatus === "ARCHIVED") {
      return {
        success: false,
        error: "La tarea ya está archivada.",
      };
    }

    return {
      success: true,
      patch: {
        status: "ARCHIVED",
        archivedAt: now,
      },
      historyAction: "ARCHIVED",
    };
  }

  if (action === "RESTORE") {
    if (currentStatus !== "ARCHIVED") {
      return {
        success: false,
        error: "Solo una tarea archivada puede restaurarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "PENDING",
        archivedAt: null,
        completedAt: null,
      },
      historyAction: "RESTORED",
    };
  }

  return {
    success: false,
    error: "La acción solicitada no es válida.",
  };
}
