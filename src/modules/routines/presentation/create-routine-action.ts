"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { createRoutine } from "../application/create-routine";
import { getRoutineSchedulesFromFormData } from "./routine-form-data";

export async function createRoutineAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();
    const result = await createRoutine({
      userId,
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
    revalidatePath("/daily-plan");

    return {
      status: "success",
      message:
        result.generation?.conflicts
          ? `Rutina creada. ${result.generation.conflicts} ocurrencia(s) no se generaron por conflicto.`
          : "Rutina creada correctamente.",
    };
  } catch (error: unknown) {
    console.error("No se pudo crear la rutina:", error);
    return {
      status: "error",
      message: "No se pudo crear la rutina. Intenta nuevamente.",
    };
  }
}
