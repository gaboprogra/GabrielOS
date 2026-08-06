"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { createProject } from "../application/create-project";

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await createProject({
      userId,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/projects");

    return {
      status: "success",
      message: "Proyecto creado correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo crear el proyecto:", error);

    return {
      status: "error",
      message: "Ocurrió un error al guardar el proyecto. Intenta nuevamente.",
    };
  }
}
