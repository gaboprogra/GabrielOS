"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { changeProjectStatus } from "../application/change-project-status";

export async function changeProjectStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await changeProjectStatus({
      userId,
      projectId: formData.get("projectId"),
      action: formData.get("action"),
      now: new Date(),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/projects");
    revalidatePath("/tasks");

    return {
      status: "success",
      message: "Proyecto actualizado correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo cambiar el estado del proyecto:", error);

    return {
      status: "error",
      message: "No se pudo cambiar el estado del proyecto.",
    };
  }
}
