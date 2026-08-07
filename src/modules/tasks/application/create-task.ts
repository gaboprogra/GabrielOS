import { createTaskSchema } from "../domain/create-task-schema";
import {
  createTaskWithHistory,
  validateTaskRelations,
} from "../infrastructure/task-repository";

type CreateTaskCommand = {
  userId: string;
  title: unknown;
  description: unknown;
  categoryId: unknown;
  projectId: unknown;
  priority: unknown;
  dueAt: unknown;
  estimatedMinutes: unknown;
  kind: unknown;
};

export type CreateTaskResult =
  | {
      success: true;
      taskId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createTask(
  command: CreateTaskCommand,
): Promise<CreateTaskResult> {
  const validation = createTaskSchema.safeParse({
    title: command.title,
    description: command.description,
    categoryId: command.categoryId,
    projectId: command.projectId,
    priority: command.priority,
    dueAt: command.dueAt,
    estimatedMinutes: command.estimatedMinutes,
    kind: command.kind,
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "Los datos de la tarea no son válidos.",
    };
  }

  const relations = await validateTaskRelations(
    command.userId,
    validation.data.categoryId,
    validation.data.projectId,
  );

  if (!relations.categoryIsValid) {
    return {
      success: false,
      error: "La categoría seleccionada no existe o no está disponible.",
    };
  }

  if (!relations.projectIsValid) {
    return {
      success: false,
      error: "El proyecto seleccionado no existe o no está activo.",
    };
  }

  const task = await createTaskWithHistory({
    userId: command.userId,
    title: validation.data.title,
    description: validation.data.description,
    categoryId: validation.data.categoryId,
    projectId: validation.data.projectId,
    priority: validation.data.priority,
    dueAt: validation.data.dueAt,
    estimatedMinutes: validation.data.estimatedMinutes,
    kind: validation.data.kind,
  });

  return {
    success: true,
    taskId: task.id,
  };
}
