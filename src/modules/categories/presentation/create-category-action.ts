"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { createCategory } from "../application/create-category";

export async function createCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getCurrentDevelopmentUserId();

  try {
    const result = await createCategory({
      userId,
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

    return {
      status: "success",
      message: "Categoría creada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo crear la categoría:", error);

    return {
      status: "error",
      message: "Ocurrió un error al guardar la categoría. Intenta nuevamente.",
    };
  }
}
