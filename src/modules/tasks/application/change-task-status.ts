import { changeTaskStatusSchema } from "../domain/change-task-status-schema";
import { changeTaskStatusWithHistory } from "../infrastructure/task-repository";

type ChangeTaskStatusCommand = {
  userId: string;
  taskId: unknown;
  action: unknown;
  now: Date;
};

export type ChangeTaskStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function changeTaskStatus(
  command: ChangeTaskStatusCommand,
): Promise<ChangeTaskStatusResult> {
  const validation = changeTaskStatusSchema.safeParse({
    taskId: command.taskId,
    action: command.action,
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "La acción solicitada no es válida.",
    };
  }

  const result = await changeTaskStatusWithHistory({
    userId: command.userId,
    taskId: validation.data.taskId,
    action: validation.data.action,
    now: command.now,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
  };
}
