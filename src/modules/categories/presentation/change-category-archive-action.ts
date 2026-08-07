"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { changeCategoryArchive } from "../application/change-category-archive";

export async function changeCategoryArchiveAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await changeCategoryArchive({
      userId,
      categoryId: formData.get("categoryId"),
      action: formData.get("action"),
      now: new Date(),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/categories");
    revalidatePath("/tasks");

    return {
      status: "success",
      message: "Categoría actualizada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo cambiar la categoría:", error);

    return {
      status: "error",
      message: "No se pudo cambiar el estado de la categoría.",
    };
  }
}
