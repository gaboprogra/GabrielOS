"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { changeRoutineActive } from "../application/change-routine-active";

export async function changeRoutineActiveAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();
    const result = await changeRoutineActive({
      userId,
      routineId: formData.get("routineId"),
      isActive: formData.get("isActive") === "true",
    });

    if (!result.success) {
      return { status: "error", message: result.error };
    }

    revalidatePath("/routines");
    revalidatePath("/daily-plan");
    return { status: "success", message: "Estado actualizado." };
  } catch (error: unknown) {
    console.error("No se pudo cambiar el estado de la rutina:", error);
    return { status: "error", message: "No se pudo actualizar la rutina." };
  }
}
