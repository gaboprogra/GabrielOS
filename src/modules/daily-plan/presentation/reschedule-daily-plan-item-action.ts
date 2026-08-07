"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/shared/application/action-state";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

import { rescheduleDailyPlanItem } from "../application/reschedule-daily-plan-item";

export async function rescheduleDailyPlanItemAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let result: Awaited<ReturnType<typeof rescheduleDailyPlanItem>>;

  try {
    const userId = await getCurrentDevelopmentUserId();

    result = await rescheduleDailyPlanItem({
      userId,
      dailyPlanItemId: formData.get("dailyPlanItemId"),
      plannedDate: formData.get("plannedDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      notes: formData.get("notes"),
    });
  } catch (error: unknown) {
    console.error("No se pudo reprogramar la actividad:", error);

    return {
      status: "error",
      message: "No se pudo reprogramar la actividad. Intenta nuevamente.",
    };
  }

  if (!result.success) {
    return {
      status: "error",
      message: result.error,
    };
  }

  revalidatePath("/daily-plan");
  redirect(`/daily-plan?date=${result.plannedDate}`);
}
