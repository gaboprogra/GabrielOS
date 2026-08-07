import { describe, expect, it } from "vitest";

import { updateTaskSchema } from "./update-task-schema";

describe("updateTaskSchema", () => {
  it("acepta una actualización válida", () => {
    const result = updateTaskSchema.safeParse({
      taskId: "task-id",
      title: "Continuar GabrielOS",
      description: "Terminar el módulo de tareas.",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "HIGH",
      dueAt: "2026-08-12T20:00",
      estimatedMinutes: "120",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una actualización sin identificador", () => {
    const result = updateTaskSchema.safeParse({
      taskId: "",
      title: "Continuar GabrielOS",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "MEDIUM",
      dueAt: "",
      estimatedMinutes: "",
    });

    expect(result.success).toBe(false);
  });

  it("reutiliza las reglas de creación", () => {
    const result = updateTaskSchema.safeParse({
      taskId: "task-id",
      title: "A",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "INVALID",
      dueAt: "",
      estimatedMinutes: "",
    });

    expect(result.success).toBe(false);
  });
});
