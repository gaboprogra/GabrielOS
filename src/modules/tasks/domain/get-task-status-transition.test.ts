import { describe, expect, it } from "vitest";

import { getTaskStatusTransition } from "./get-task-status-transition";

const now = new Date("2026-08-07T00:30:00.000Z");

describe("getTaskStatusTransition", () => {
  it("inicia una tarea pendiente", () => {
    const result = getTaskStatusTransition("PENDING", "START", now);

    expect(result).toEqual({
      success: true,
      patch: {
        status: "IN_PROGRESS",
      },
      historyAction: "STATUS_CHANGED",
    });
  });

  it("completa una tarea en progreso", () => {
    const result = getTaskStatusTransition("IN_PROGRESS", "COMPLETE", now);

    expect(result).toEqual({
      success: true,
      patch: {
        status: "COMPLETED",
        completedAt: now,
        archivedAt: null,
      },
      historyAction: "COMPLETED",
    });
  });

  it("archiva una tarea completada", () => {
    const result = getTaskStatusTransition("COMPLETED", "ARCHIVE", now);

    expect(result).toEqual({
      success: true,
      patch: {
        status: "ARCHIVED",
        archivedAt: now,
      },
      historyAction: "ARCHIVED",
    });
  });

  it("restaura una tarea como pendiente", () => {
    const result = getTaskStatusTransition("ARCHIVED", "RESTORE", now);

    expect(result).toEqual({
      success: true,
      patch: {
        status: "PENDING",
        archivedAt: null,
        completedAt: null,
      },
      historyAction: "RESTORED",
    });
  });

  it("rechaza iniciar una tarea completada", () => {
    const result = getTaskStatusTransition("COMPLETED", "START", now);

    expect(result.success).toBe(false);
  });
});
