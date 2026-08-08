import { parseDateInput } from "@/shared/domain/date-input";

import { updateRoutineSchema } from "../domain/routine-schema";
import { updateRoutineWithHistory } from "../infrastructure/routine-repository";
import { generateRoutineWindow } from "./generate-routine-window";
import { reconcileRoutineWindow } from "./reconcile-routine-window";

type UpdateRoutineCommand = {
  userId: string;
  routineId: unknown;
  taskId: unknown;
  startDate: unknown;
  endDate: unknown;
  isActive: unknown;
  schedules: unknown;
};

export async function updateRoutine(command: UpdateRoutineCommand) {
  const validation = updateRoutineSchema.safeParse(command);

  if (!validation.success) {
    return {
      success: false as const,
      error: validation.error.issues[0]?.message ?? "La rutina no es válida.",
    };
  }

  const startDate = parseDateInput(validation.data.startDate);
  const endDate = validation.data.endDate
    ? parseDateInput(validation.data.endDate)
    : null;

  if (!startDate || (validation.data.endDate && !endDate)) {
    return { success: false as const, error: "Las fechas no son válidas." };
  }

  const result = await updateRoutineWithHistory({
    userId: command.userId,
    routineId: validation.data.routineId,
    taskId: validation.data.taskId,
    startDate,
    endDate,
    isActive: validation.data.isActive,
    schedules: validation.data.schedules,
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
    routineId: result.routineId,
    reconciliation,
    generation,
  };
}
