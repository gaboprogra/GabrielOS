import type { ProjectStatus, ProjectStatusAction } from "./project-status";

type ProjectStatusPatch = {
  status: ProjectStatus;
  completedAt?: Date | null;
  archivedAt?: Date | null;
};

type HistoryAction = "COMPLETED" | "ARCHIVED" | "RESTORED" | "STATUS_CHANGED";

export type ProjectStatusTransitionResult =
  | {
      success: true;
      patch: ProjectStatusPatch;
      historyAction: HistoryAction;
    }
  | {
      success: false;
      error: string;
    };

export function getProjectStatusTransition(
  currentStatus: ProjectStatus,
  action: ProjectStatusAction,
  now: Date,
): ProjectStatusTransitionResult {
  if (action === "COMPLETE") {
    if (currentStatus !== "ACTIVE") {
      return {
        success: false,
        error: "Solo un proyecto activo puede completarse.",
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

  if (action === "REOPEN") {
    if (currentStatus !== "COMPLETED") {
      return {
        success: false,
        error: "Solo un proyecto completado puede reabrirse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "ACTIVE",
        completedAt: null,
        archivedAt: null,
      },
      historyAction: "STATUS_CHANGED",
    };
  }

  if (action === "ARCHIVE") {
    if (currentStatus === "ARCHIVED") {
      return {
        success: false,
        error: "El proyecto ya está archivado.",
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
        error: "Solo un proyecto archivado puede restaurarse.",
      };
    }

    return {
      success: true,
      patch: {
        status: "ACTIVE",
        completedAt: null,
        archivedAt: null,
      },
      historyAction: "RESTORED",
    };
  }

  return {
    success: false,
    error: "La acción solicitada no es válida.",
  };
}
