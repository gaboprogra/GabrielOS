import { updateCategorySchema } from "../domain/update-category-schema";
import { updateCategoryWithHistory } from "../infrastructure/category-repository";

type UpdateCategoryCommand = {
  userId: string;
  categoryId: unknown;
  name: unknown;
  color: unknown;
};

export type UpdateCategoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateCategory(
  command: UpdateCategoryCommand,
): Promise<UpdateCategoryResult> {
  const validation = updateCategorySchema.safeParse({
    categoryId: command.categoryId,
    name: command.name,
    color: command.color,
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "Los datos de la categoría no son válidos.",
    };
  }

  return updateCategoryWithHistory({
    userId: command.userId,
    categoryId: validation.data.categoryId,
    name: validation.data.name,
    color: validation.data.color,
  });
}
