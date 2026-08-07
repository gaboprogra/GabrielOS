import { z } from "zod";

import { dailyPlanItemTimingSchema } from "./schedule-daily-plan-item-schema";

export const rescheduleDailyPlanItemSchema = dailyPlanItemTimingSchema.and(
  z.object({
    dailyPlanItemId: z
      .string()
      .trim()
      .min(1, "La actividad no es válida."),
  }),
);
