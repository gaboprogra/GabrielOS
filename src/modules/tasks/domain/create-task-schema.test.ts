import { describe, expect, it } from "vitest";

import { createTaskSchema } from "./create-task-schema";

describe("createTaskSchema", () => {
  it("acepta una tarea completa", () => {
    const result = createTaskSchema.safeParse({
      title: "Preparar práctica",
      description: "Revisar los ejercicios pendientes.",
      categoryId: "category-id",
      projectId: "project-id",
      kind: "ONE_TIME",
      priority: "HIGH",
      dueAt: "2026-08-10T19:30",
      estimatedMinutes: "90",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.dueAt?.toISOString()).toBe("2026-08-10T23:30:00.000Z");
      expect(result.data.estimatedMinutes).toBe(90);
    }
  });

  it("acepta una tarea sin datos opcionales", () => {
    const result = createTaskSchema.safeParse({
      title: "Comprar alimentos",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "MEDIUM",
      dueAt: "",
      estimatedMinutes: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.categoryId).toBeNull();
      expect(result.data.projectId).toBeNull();
      expect(result.data.dueAt).toBeNull();
      expect(result.data.estimatedMinutes).toBeNull();
    }
  });

  it("rechaza una prioridad inválida", () => {
    const result = createTaskSchema.safeParse({
      title: "Tarea válida",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "EXTREME",
      dueAt: "",
      estimatedMinutes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una duración inferior a cinco minutos", () => {
    const result = createTaskSchema.safeParse({
      title: "Tarea válida",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "LOW",
      dueAt: "",
      estimatedMinutes: "2",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una fecha inexistente", () => {
    const result = createTaskSchema.safeParse({
      title: "Tarea válida",
      description: "",
      categoryId: "",
      projectId: "",
      kind: "ONE_TIME",
      priority: "MEDIUM",
      dueAt: "2026-02-30T10:00",
      estimatedMinutes: "",
    });

    expect(result.success).toBe(false);
  });
});
