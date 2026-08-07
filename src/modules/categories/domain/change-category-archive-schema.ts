import { z } from "zod";

export const CATEGORY_ARCHIVE_ACTIONS = ["ARCHIVE", "RESTORE"] as const;

export type CategoryArchiveAction = (typeof CATEGORY_ARCHIVE_ACTIONS)[number];

export const changeCategoryArchiveSchema = z.object({
  categoryId: z.string().trim().min(1, "La categoría no es válida."),

  action: z.enum(CATEGORY_ARCHIVE_ACTIONS),
});
