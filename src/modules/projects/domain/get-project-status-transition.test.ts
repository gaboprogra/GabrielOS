import { describe, expect, it } from "vitest";

import { getProjectStatusTransition } from "./get-project-status-transition";

const now = new Date("2026-08-07T02:00:00.000Z");

describe("getProjectStatusTransition", () => {
  it("completa un proyecto activo", () => {
    const result = getProjectStatusTransition("ACTIVE", "COMPLETE", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("COMPLETED");
      expect(result.patch.completedAt).toBe(now);
    }
  });

  it("reabre un proyecto completado", () => {
    const result = getProjectStatusTransition("COMPLETED", "REOPEN", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("ACTIVE");
      expect(result.patch.completedAt).toBeNull();
    }
  });

  it("restaura un proyecto archivado", () => {
    const result = getProjectStatusTransition("ARCHIVED", "RESTORE", now);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.patch.status).toBe("ACTIVE");
    }
  });

  it("rechaza completar un proyecto archivado", () => {
    const result = getProjectStatusTransition("ARCHIVED", "COMPLETE", now);

    expect(result.success).toBe(false);
  });
});
