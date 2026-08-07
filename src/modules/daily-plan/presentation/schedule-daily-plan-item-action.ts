"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { scheduleDailyPlanItem } from "../application/schedule-daily-plan-item";

export async function scheduleDailyPlanItemAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await scheduleDailyPlanItem({
      userId,
      taskId: formData.get("taskId"),
      plannedDate: formData.get("plannedDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      notes: formData.get("notes"),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/daily-plan");

    return {
      status: "success",
      message: result.calendarSynced
        ? "Tarea programada y sincronizada con Google Calendar."
        : "Tarea programada, pero Google Calendar no pudo sincronizarse.",
    };
  } catch (error: unknown) {
    console.error("No se pudo programar la tarea:", error);

    return {
      status: "error",
      message: "No se pudo programar la tarea. Intenta nuevamente.",
    };
  }
}
