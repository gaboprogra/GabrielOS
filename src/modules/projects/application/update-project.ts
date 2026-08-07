import { updateProjectSchema } from "../domain/update-project-schema";
import { updateProjectWithHistory } from "../infrastructure/project-repository";

type UpdateProjectCommand = {
  userId: string;
  projectId: unknown;
  name: unknown;
  description: unknown;
  startDate: unknown;
  dueDate: unknown;
};

export type UpdateProjectResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateProject(
  command: UpdateProjectCommand,
): Promise<UpdateProjectResult> {
  const validation = updateProjectSchema.safeParse({
    projectId: command.projectId,
    name: command.name,
    description: command.description,
    startDate: command.startDate,
    dueDate: command.dueDate,
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "Los datos del proyecto no son válidos.",
    };
  }

  return updateProjectWithHistory({
    userId: command.userId,
    projectId: validation.data.projectId,
    name: validation.data.name,
    description: validation.data.description,
    startDate: validation.data.startDate,
    dueDate: validation.data.dueDate,
  });
}
