import { z } from "zod";

import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";

const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const nullableIdSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

const optionalDueAtSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || parseBoliviaDateTime(value) !== null,
    "La fecha y hora límite no son válidas.",
  )
  .transform((value) => (value === "" ? null : parseBoliviaDateTime(value)));

const optionalEstimatedMinutesSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+$/.test(value),
    "La duración debe ser un número entero.",
  )
  .transform((value) => (value === "" ? null : Number(value)))
  .refine(
    (value) => value === null || (value >= 5 && value <= 1440),
    "La duración debe estar entre 5 y 1440 minutos.",
  );

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres.")
    .max(200, "El título no puede superar los 200 caracteres."),

  description: z
    .string()
    .trim()
    .max(3000, "La descripción no puede superar los 3000 caracteres.")
    .transform((value) => (value === "" ? null : value)),

  categoryId: nullableIdSchema,
  projectId: nullableIdSchema,

  priority: z.enum(taskPriorities, {
    message: "La prioridad seleccionada no es válida.",
  }),

  dueAt: optionalDueAtSchema,
  estimatedMinutes: optionalEstimatedMinutesSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
