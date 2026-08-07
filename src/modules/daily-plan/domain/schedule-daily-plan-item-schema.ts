import { z } from "zod";

import { parseDateInput } from "@/shared/domain/date-input";

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora ingresada no es válida.");

export const scheduleDailyPlanItemSchema = z
  .object({
    taskId: z.string().trim().min(1, "Debes seleccionar una tarea."),

    plannedDate: z
      .string()
      .trim()
      .refine(
        (value) => parseDateInput(value) !== null,
        "La fecha seleccionada no es válida.",
      ),

    startTime: timeSchema,
    endTime: timeSchema,

    notes: z
      .string()
      .trim()
      .max(1000, "Las notas no pueden superar los 1000 caracteres.")
      .transform((value) => (value === "" ? null : value)),
  })
  .superRefine((data, context) => {
    if (data.endTime <= data.startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "La hora final debe ser posterior a la hora inicial.",
      });
    }
  });
