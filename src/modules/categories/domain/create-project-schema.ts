import { z } from "zod";

function isValidDateInput(value: string): boolean {
  if (value === "") {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const optionalDateSchema = z
  .string()
  .trim()
  .refine(isValidDateInput, "La fecha ingresada no es válida.")
  .transform((value) =>
    value === "" ? null : new Date(`${value}T00:00:00.000Z`),
  );

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(100, "El nombre no puede superar los 100 caracteres."),

    description: z
      .string()
      .trim()
      .max(1000, "La descripción no puede superar los 1000 caracteres.")
      .transform((value) => (value === "" ? null : value)),

    startDate: optionalDateSchema,
    dueDate: optionalDateSchema,
  })
  .superRefine((project, context) => {
    if (
      project.startDate &&
      project.dueDate &&
      project.dueDate < project.startDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "La fecha límite no puede ser anterior a la fecha de inicio.",
      });
    }
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
