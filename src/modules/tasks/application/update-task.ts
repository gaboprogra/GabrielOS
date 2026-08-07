import { updateTaskSchema } from "../domain/update-task-schema";
import {
  updateTaskWithHistory,
  validateTaskRelations,
} from "../infrastructure/task-repository";

type UpdateTaskCommand = {
  userId: string;
  taskId: unknown;
  title: unknown;
  description: unknown;
  categoryId: unknown;
  projectId: unknown;
  priority: unknown;
  dueAt: unknown;
  estimatedMinutes: unknown;
};

export type UpdateTaskResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateTask(
  command: UpdateTaskCommand,
): Promise<UpdateTaskResult> {
  const validation = updateTaskSchema.safeParse({
    taskId: command.taskId,
    title: command.title,
    description: command.description,
    categoryId: command.categoryId,
    projectId: command.projectId,
    priority: command.priority,
    dueAt: command.dueAt,
    estimatedMinutes: command.estimatedMinutes,
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
      error: "La categoría seleccionada no existe o está archivada.",
    };
  }

  if (!relations.projectIsValid) {
    return {
      success: false,
      error: "El proyecto seleccionado no existe o no está activo.",
    };
  }

  return updateTaskWithHistory({
    userId: command.userId,
    taskId: validation.data.taskId,
    title: validation.data.title,
    description: validation.data.description,
    categoryId: validation.data.categoryId,
    projectId: validation.data.projectId,
    priority: validation.data.priority,
    dueAt: validation.data.dueAt,
    estimatedMinutes: validation.data.estimatedMinutes,
  });
}
