import { z } from "zod";

import { DAILY_PLAN_ITEM_ACTIONS } from "./daily-plan-item-status";

export const changeDailyPlanItemStatusSchema = z.object({
  dailyPlanItemId: z.string().trim().min(1, "La actividad no es válida."),

  action: z.enum(DAILY_PLAN_ITEM_ACTIONS),
});
