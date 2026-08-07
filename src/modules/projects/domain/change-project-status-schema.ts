import { z } from "zod";

import { PROJECT_STATUS_ACTIONS } from "./project-status";

export const changeProjectStatusSchema = z.object({
  projectId: z.string().trim().min(1, "El proyecto no es válido."),

  action: z.enum(PROJECT_STATUS_ACTIONS),
});
