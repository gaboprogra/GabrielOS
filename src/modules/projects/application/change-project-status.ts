import { changeProjectStatusSchema } from "../domain/change-project-status-schema";
import { changeProjectStatusWithHistory } from "../infrastructure/project-repository";

type ChangeProjectStatusCommand = {
  userId: string;
  projectId: unknown;
  action: unknown;
  now: Date;
};

export type ChangeProjectStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function changeProjectStatus(
  command: ChangeProjectStatusCommand,
): Promise<ChangeProjectStatusResult> {
  const validation = changeProjectStatusSchema.safeParse({
    projectId: command.projectId,
    action: command.action,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "La acción no es válida.",
    };
  }

  const result = await changeProjectStatusWithHistory({
    userId: command.userId,
    projectId: validation.data.projectId,
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
