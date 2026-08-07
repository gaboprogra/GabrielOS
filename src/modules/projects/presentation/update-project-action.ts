"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { updateProject } from "../application/update-project";

export async function updateProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();
    const projectId = String(formData.get("projectId") ?? "");

    const result = await updateProject({
      userId,
      projectId,
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
    revalidatePath(`/projects/${projectId}/edit`);
    revalidatePath("/tasks");

    return {
      status: "success",
      message: "Proyecto actualizado correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo actualizar el proyecto:", error);

    return {
      status: "error",
      message: "No se pudo actualizar el proyecto.",
    };
  }
}
