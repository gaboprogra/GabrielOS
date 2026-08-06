import { describe, expect, it } from "vitest";

import { createProjectSchema } from "../../categories/domain/create-project-schema";

describe("createProjectSchema", () => {
  it("acepta un proyecto válido", () => {
    const result = createProjectSchema.safeParse({
      name: "GabrielOS",
      description: "Sistema personal de organización.",
      startDate: "2026-08-06",
      dueDate: "2026-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("convierte fechas vacías y descripción vacía en null", () => {
    const result = createProjectSchema.safeParse({
      name: "Universidad",
      description: "",
      startDate: "",
      dueDate: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.startDate).toBeNull();
      expect(result.data.dueDate).toBeNull();
    }
  });

  it("rechaza una fecha límite anterior al inicio", () => {
    const result = createProjectSchema.safeParse({
      name: "Proyecto incorrecto",
      description: "",
      startDate: "2026-12-31",
      dueDate: "2026-08-06",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza fechas inexistentes", () => {
    const result = createProjectSchema.safeParse({
      name: "Proyecto incorrecto",
      description: "",
      startDate: "2026-02-30",
      dueDate: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza nombres demasiado cortos", () => {
    const result = createProjectSchema.safeParse({
      name: "A",
      description: "",
      startDate: "",
      dueDate: "",
    });

    expect(result.success).toBe(false);
  });
});
