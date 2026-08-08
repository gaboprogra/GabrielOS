import { z } from "zod";

import { parseDateInput } from "@/shared/domain/date-input";

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora no es válida.");

export const routineScheduleSchema = z
  .object({
    dayOfWeek: z.enum(DAYS_OF_WEEK),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .superRefine((schedule, context) => {
    if (schedule.endTime <= schedule.startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "La hora final debe ser posterior a la inicial.",
      });
    }
  });

export const routineDataSchema = z
  .object({
    taskId: z.string().trim().min(1, "Debes seleccionar una tarea."),
    startDate: z
      .string()
      .trim()
      .refine(
        (value) => parseDateInput(value) !== null,
        "La fecha inicial no es válida.",
      ),
    endDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || parseDateInput(value) !== null,
        "La fecha final no es válida.",
      )
      .transform((value) => (value === "" ? null : value)),
    isActive: z.boolean(),
    schedules: z
      .array(routineScheduleSchema)
      .min(1, "Agrega al menos un horario.")
      .max(7, "Una rutina admite como máximo un horario por día."),
  })
  .superRefine((routine, context) => {
    if (routine.endDate && routine.endDate < routine.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha final no puede ser anterior a la inicial.",
      });
    }

    const uniqueDays = new Set(
      routine.schedules.map((schedule) => schedule.dayOfWeek),
    );

    if (uniqueDays.size !== routine.schedules.length) {
      context.addIssue({
        code: "custom",
        path: ["schedules"],
        message: "No puedes repetir un día en la misma rutina.",
      });
    }
  });

export const updateRoutineSchema = routineDataSchema.and(
  z.object({
    routineId: z.string().trim().min(1, "La rutina no es válida."),
  }),
);

export const changeRoutineActiveSchema = z.object({
  routineId: z.string().trim().min(1, "La rutina no es válida."),
  isActive: z.boolean(),
});

export type RoutineDataInput = z.infer<typeof routineDataSchema>;
