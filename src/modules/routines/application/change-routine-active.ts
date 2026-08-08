import { changeRoutineActiveSchema } from "../domain/routine-schema";
import { changeRoutineActiveWithHistory } from "../infrastructure/routine-repository";
import { generateRoutineWindow } from "./generate-routine-window";
import { reconcileRoutineWindow } from "./reconcile-routine-window";

export async function changeRoutineActive(command: {
  userId: string;
  routineId: unknown;
  isActive: unknown;
}) {
  const validation = changeRoutineActiveSchema.safeParse(command);

  if (!validation.success) {
    return {
      success: false as const,
      error: validation.error.issues[0]?.message ?? "La rutina no es válida.",
    };
  }

  const result = await changeRoutineActiveWithHistory({
    userId: command.userId,
    routineId: validation.data.routineId,
    isActive: validation.data.isActive,
  });

  if (!result.success) {
    return result;
  }

  const now = new Date();
  const reconciliation = await reconcileRoutineWindow({
    userId: command.userId,
    routineId: result.routineId,
    now,
  });
  const generation = validation.data.isActive
    ? await generateRoutineWindow({
        userId: command.userId,
        routineId: result.routineId,
        now,
      })
    : null;

  return {
    success: true as const,
    reconciliation,
    generation,
  };
}
