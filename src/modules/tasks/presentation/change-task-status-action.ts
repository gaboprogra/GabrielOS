"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { changeTaskStatus } from "../application/change-task-status";

export async function changeTaskStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await changeTaskStatus({
      userId,
      taskId: formData.get("taskId"),
      action: formData.get("action"),
      now: new Date(),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/tasks");
    revalidatePath("/tasks/archived");

    return {
      status: "success",
      message: "Estado actualizado correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo cambiar el estado de la tarea:", error);

    return {
      status: "error",
      message: "No se pudo actualizar la tarea. Intenta nuevamente.",
    };
  }
}
