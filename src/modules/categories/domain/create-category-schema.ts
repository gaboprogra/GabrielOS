import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe tener formato hexadecimal."),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
