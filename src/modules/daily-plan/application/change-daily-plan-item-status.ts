import { changeDailyPlanItemStatusSchema } from "../domain/change-daily-plan-item-status-schema";
import { changeDailyPlanItemStatusWithHistory } from "../infrastructure/daily-plan-repository";

type ChangeDailyPlanItemStatusCommand = {
  userId: string;
  dailyPlanItemId: unknown;
  action: unknown;
  now: Date;
};

export type ChangeDailyPlanItemStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function changeDailyPlanItemStatus(
  command: ChangeDailyPlanItemStatusCommand,
): Promise<ChangeDailyPlanItemStatusResult> {
  const validation = changeDailyPlanItemStatusSchema.safeParse({
    dailyPlanItemId: command.dailyPlanItemId,
    action: command.action,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "La acción no es válida.",
    };
  }

  return changeDailyPlanItemStatusWithHistory({
    userId: command.userId,
    dailyPlanItemId: validation.data.dailyPlanItemId,
    action: validation.data.action,
    now: command.now,
  });
}
