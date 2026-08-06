import { describe, expect, it } from "vitest";

import { createCategorySchema } from "./create-category-schema";

describe("createCategorySchema", () => {
  it("acepta una categoría válida", () => {
    const result = createCategorySchema.safeParse({
      name: "Universidad",
      color: "#2563EB",
    });

    expect(result.success).toBe(true);
  });

  it("elimina espacios del nombre", () => {
    const result = createCategorySchema.safeParse({
      name: "  Trabajo  ",
      color: "#16A34A",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Trabajo");
    }
  });

  it("rechaza nombres demasiado cortos", () => {
    const result = createCategorySchema.safeParse({
      name: "A",
      color: "#2563EB",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza colores inválidos", () => {
    const result = createCategorySchema.safeParse({
      name: "Personal",
      color: "azul",
    });

    expect(result.success).toBe(false);
  });
});
