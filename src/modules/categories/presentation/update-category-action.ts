"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { updateCategory } from "../application/update-category";

export async function updateCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();
    const categoryId = String(formData.get("categoryId") ?? "");

    const result = await updateCategory({
      userId,
      categoryId,
      name: formData.get("name"),
      color: formData.get("color"),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/categories");
    revalidatePath(`/categories/${categoryId}/edit`);

    return {
      status: "success",
      message: "Categoría actualizada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo actualizar la categoría:", error);

    return {
      status: "error",
      message: "No se pudo actualizar la categoría.",
    };
  }
}
