"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { createTask } from "../application/create-task";

export async function createTaskAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await createTask({
      userId,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      projectId: String(formData.get("projectId") ?? ""),
      priority: String(formData.get("priority") ?? ""),
      dueAt: String(formData.get("dueAt") ?? ""),
      estimatedMinutes: String(formData.get("estimatedMinutes") ?? ""),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/tasks");

    return {
      status: "success",
      message: "Tarea creada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo crear la tarea:", error);

    return {
      status: "error",
      message: "Ocurrió un error al guardar la tarea. Intenta nuevamente.",
    };
  }
}
