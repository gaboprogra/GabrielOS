import { z } from "zod";

import { createCategorySchema } from "./create-category-schema";

export const updateCategorySchema = createCategorySchema.extend({
  categoryId: z.string().trim().min(1, "La categoría no es válida."),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
