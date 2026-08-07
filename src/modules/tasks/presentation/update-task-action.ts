"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { updateTask } from "../application/update-task";

export async function updateTaskAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const taskId = String(formData.get("taskId") ?? "");

    const result = await updateTask({
      userId,
      taskId,
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
    revalidatePath(`/tasks/${taskId}/edit`);

    return {
      status: "success",
      message: "Tarea actualizada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo actualizar la tarea:", error);

    return {
      status: "error",
      message: "Ocurrió un error al actualizar la tarea. Intenta nuevamente.",
    };
  }
}
