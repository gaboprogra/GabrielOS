import { createProjectSchema } from "../domain/create-project-schema";
import {
  createProjectWithHistory,
  findProjectByName,
} from "../infrastructure/project-repository";

type CreateProjectCommand = {
  userId: string;
  name: unknown;
  description: unknown;
  startDate: unknown;
  dueDate: unknown;
};

export type CreateProjectResult =
  | {
      success: true;
      projectId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createProject(
  command: CreateProjectCommand,
): Promise<CreateProjectResult> {
  const validation = createProjectSchema.safeParse({
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

  const existingProject = await findProjectByName(
    command.userId,
    validation.data.name,
  );

  if (existingProject) {
    return {
      success: false,
      error: "Ya existe un proyecto con ese nombre.",
    };
  }

  const project = await createProjectWithHistory({
    userId: command.userId,
    name: validation.data.name,
    description: validation.data.description,
    startDate: validation.data.startDate,
    dueDate: validation.data.dueDate,
  });

  return {
    success: true,
    projectId: project.id,
  };
}
