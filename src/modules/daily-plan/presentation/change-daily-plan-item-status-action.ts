"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { changeDailyPlanItemStatus } from "../application/change-daily-plan-item-status";

export async function changeDailyPlanItemStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const userId = await getCurrentDevelopmentUserId();

    const result = await changeDailyPlanItemStatus({
      userId,
      dailyPlanItemId: formData.get("dailyPlanItemId"),
      action: formData.get("action"),
      now: new Date(),
    });

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidatePath("/daily-plan");
    revalidatePath("/tasks");

    return {
      status: "success",
      message: "Actividad actualizada.",
    };
  } catch (error: unknown) {
    console.error("No se pudo actualizar la actividad:", error);

    return {
      status: "error",
      message: "No se pudo actualizar la actividad.",
    };
  }
}
