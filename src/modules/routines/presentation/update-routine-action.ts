"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { updateRoutine } from "../application/update-routine";
import { getRoutineSchedulesFromFormData } from "./routine-form-data";

export async function updateRoutineAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();
    const result = await updateRoutine({
      userId,
      routineId: formData.get("routineId"),
      taskId: formData.get("taskId"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isActive: formData.get("isActive") === "on",
      schedules: getRoutineSchedulesFromFormData(formData),
    });

    if (!result.success) {
      return { status: "error", message: result.error };
    }

    revalidatePath("/routines");
    revalidatePath(`/routines/${result.routineId}/edit`);
    revalidatePath("/daily-plan");
  } catch (error: unknown) {
    console.error("No se pudo actualizar la rutina:", error);
    return {
      status: "error",
      message: "No se pudo actualizar la rutina. Intenta nuevamente.",
    };
  }

  redirect("/routines");
}
