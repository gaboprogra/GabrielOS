import { z } from "zod";

import { TASK_STATUS_ACTIONS } from "./task";

export const changeTaskStatusSchema = z.object({
  taskId: z.string().trim().min(1, "La tarea no es válida."),

  action: z.enum(TASK_STATUS_ACTIONS),
});

export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
