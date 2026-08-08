import { parseDateInput } from "@/shared/domain/date-input";

import { routineDataSchema } from "../domain/routine-schema";
import { createRoutineWithHistory } from "../infrastructure/routine-repository";
import { generateRoutineWindow } from "./generate-routine-window";

type CreateRoutineCommand = {
  userId: string;
  taskId: unknown;
  startDate: unknown;
  endDate: unknown;
  isActive: unknown;
  schedules: unknown;
};

export async function createRoutine(command: CreateRoutineCommand) {
  const validation = routineDataSchema.safeParse(command);

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

  const result = await createRoutineWithHistory({
    userId: command.userId,
    taskId: validation.data.taskId,
    startDate,
    endDate,
    isActive: validation.data.isActive,
    schedules: validation.data.schedules,
  });

  if (!result.success) {
    return result;
  }

  const generation = validation.data.isActive
    ? await generateRoutineWindow({
        userId: command.userId,
        routineId: result.routineId,
        now: new Date(),
      })
    : null;

  return { success: true as const, routineId: result.routineId, generation };
}
