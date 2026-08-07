import { describe, expect, it } from "vitest";

import { updateCategorySchema } from "./update-category-schema";

describe("updateCategorySchema", () => {
  it("acepta una categoría válida", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: "category-id",
      name: "Universidad",
      color: "#2563EB",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una categoría sin identificador", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: "",
      name: "Universidad",
      color: "#2563EB",
    });

    expect(result.success).toBe(false);
  });

  it("reutiliza las validaciones de creación", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: "category-id",
      name: "A",
      color: "azul",
    });

    expect(result.success).toBe(false);
  });
});
