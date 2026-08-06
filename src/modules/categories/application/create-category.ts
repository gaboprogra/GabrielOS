import {
  createCategoryWithHistory,
  findActiveCategoryByName,
} from "@/modules/categories/infrastructure/category-repository";

import { createCategorySchema } from "../domain/create-category-schema";

type CreateCategoryCommand = {
  userId: string;
  name: unknown;
  color: unknown;
};

export type CreateCategoryResult =
  | {
      success: true;
      categoryId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createCategory(
  command: CreateCategoryCommand,
): Promise<CreateCategoryResult> {
  const validation = createCategorySchema.safeParse({
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

  const existingCategory = await findActiveCategoryByName(
    command.userId,
    validation.data.name,
  );

  if (existingCategory) {
    return {
      success: false,
      error: "Ya existe una categoría con ese nombre.",
    };
  }

  const category = await createCategoryWithHistory({
    userId: command.userId,
    name: validation.data.name,
    color: validation.data.color,
  });

  return {
    success: true,
    categoryId: category.id,
  };
}
