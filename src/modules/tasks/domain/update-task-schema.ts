import { z } from "zod";

import { createTaskSchema } from "./create-task-schema";

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().trim().min(1, "La tarea seleccionada no es válida."),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
