import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

import { canTaskUseRoutine } from "../domain/routine-rules";
import type { DayOfWeek } from "../domain/routine-schema";

export type RoutineScheduleData = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

type RoutineMutationData = {
  userId: string;
  taskId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  schedules: RoutineScheduleData[];
};

type UpdateRoutineData = RoutineMutationData & {
  routineId: string;
};

type RoutineMutationResult =
  | { success: true; routineId: string }
  | { success: false; error: string };

export type CreateRoutineOccurrenceResult =
  | {
      status: "created";
      dailyPlanItemId: string;
      title: string;
      startsAt: Date;
      endsAt: Date;
      notes: null;
      categoryColor: string | null;
    }
  | { status: "existing" }
  | { status: "excluded" }
  | { status: "conflict"; conflictingTaskTitle: string };

export type RoutineCalendarChange =
  | {
      operation: "update";
      dailyPlanItemId: string;
      eventId: string;
      title: string;
      startsAt: Date;
      endsAt: Date;
      notes: string | null;
      categoryColor: string | null;
    }
  | {
      operation: "delete";
      dailyPlanItemId: string;
      eventId: string;
    };

export async function listRoutineTaskOptions(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      kind: "REUSABLE",
      status: { not: "ARCHIVED" },
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      category: { select: { color: true } },
    },
  });
}

export async function listRoutines(userId: string) {
  return prisma.routine.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      startDate: true,
      endDate: true,
      isActive: true,
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          category: { select: { color: true } },
        },
      },
      schedules: {
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}

export async function findRoutineForEdit(userId: string, routineId: string) {
  return prisma.routine.findFirst({
    where: { id: routineId, userId },
    select: {
      id: true,
      taskId: true,
      startDate: true,
      endDate: true,
      isActive: true,
      task: { select: { title: true } },
      schedules: {
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}

export async function createRoutineWithHistory(
  data: RoutineMutationData,
): Promise<RoutineMutationResult> {
  return prisma.$transaction(async (transaction) => {
    const task = await transaction.task.findFirst({
      where: { id: data.taskId, userId: data.userId },
      select: { id: true, title: true, kind: true, status: true },
    });

    if (!task) {
      return { success: false, error: "La tarea no existe." };
    }

    const taskRule = canTaskUseRoutine(task.kind, task.status);
    if (!taskRule.success) {
      return taskRule;
    }

    const routine = await transaction.routine.create({
      data: {
        userId: data.userId,
        taskId: task.id,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        schedules: {
          create: data.schedules.map((schedule) => ({
            ...schedule,
            isActive: true,
          })),
        },
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "ROUTINE",
        entityId: routine.id,
        action: "CREATED",
        details: {
          taskId: task.id,
          taskTitle: task.title,
          startDate: data.startDate.toISOString().slice(0, 10),
          endDate: data.endDate?.toISOString().slice(0, 10) ?? null,
          isActive: data.isActive,
          schedules: data.schedules,
        },
      },
    });

    return { success: true, routineId: routine.id };
  });
}

export async function updateRoutineWithHistory(
  data: UpdateRoutineData,
): Promise<RoutineMutationResult> {
  return prisma.$transaction(async (transaction) => {
    const routine = await transaction.routine.findFirst({
      where: { id: data.routineId, userId: data.userId },
      select: {
        id: true,
        taskId: true,
        startDate: true,
        endDate: true,
        isActive: true,
        task: { select: { id: true, title: true, kind: true, status: true } },
        schedules: {
          where: { isActive: true },
          select: { dayOfWeek: true, startTime: true, endTime: true },
        },
      },
    });

    if (!routine) {
      return { success: false, error: "La rutina no existe." };
    }

    if (data.taskId !== routine.taskId) {
      return {
        success: false,
        error: "La tarea asociada a una rutina no puede cambiarse.",
      };
    }

    const taskRule = canTaskUseRoutine(routine.task.kind, routine.task.status);
    if (!taskRule.success) {
      return taskRule;
    }

    const scheduleSignature = (schedules: RoutineScheduleData[]) =>
      schedules
        .map(
          (schedule) =>
            `${schedule.dayOfWeek}:${schedule.startTime}-${schedule.endTime}`,
        )
        .sort()
        .join("|");
    const hasChanges =
      routine.startDate.getTime() !== data.startDate.getTime() ||
      routine.endDate?.getTime() !== data.endDate?.getTime() ||
      routine.isActive !== data.isActive ||
      scheduleSignature(routine.schedules) !== scheduleSignature(data.schedules);

    if (!hasChanges) {
      return { success: true, routineId: routine.id };
    }

    await transaction.routine.updateMany({
      where: { id: routine.id, userId: data.userId },
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
    });

    await transaction.routineSchedule.updateMany({
      where: { routineId: routine.id },
      data: { isActive: false },
    });

    for (const schedule of data.schedules) {
      await transaction.routineSchedule.upsert({
        where: {
          routineId_dayOfWeek: {
            routineId: routine.id,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        create: { routineId: routine.id, ...schedule, isActive: true },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true,
        },
      });
    }

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "ROUTINE",
        entityId: routine.id,
        action: "UPDATED",
        details: {
          taskId: routine.task.id,
          before: {
            startDate: routine.startDate.toISOString().slice(0, 10),
            endDate: routine.endDate?.toISOString().slice(0, 10) ?? null,
            isActive: routine.isActive,
            schedules: routine.schedules,
          },
          after: {
            startDate: data.startDate.toISOString().slice(0, 10),
            endDate: data.endDate?.toISOString().slice(0, 10) ?? null,
            isActive: data.isActive,
            schedules: data.schedules,
          },
        },
      },
    });

    return { success: true, routineId: routine.id };
  });
}

export async function changeRoutineActiveWithHistory(input: {
  userId: string;
  routineId: string;
  isActive: boolean;
}): Promise<RoutineMutationResult> {
  return prisma.$transaction(async (transaction) => {
    const routine = await transaction.routine.findFirst({
      where: { id: input.routineId, userId: input.userId },
      select: { id: true, isActive: true, taskId: true },
    });

    if (!routine) {
      return { success: false, error: "La rutina no existe." };
    }

    if (routine.isActive === input.isActive) {
      return { success: true, routineId: routine.id };
    }

    await transaction.routine.updateMany({
      where: { id: routine.id, userId: input.userId, isActive: routine.isActive },
      data: { isActive: input.isActive },
    });

    await transaction.historyEntry.create({
      data: {
        userId: input.userId,
        entityType: "ROUTINE",
        entityId: routine.id,
        action: "STATUS_CHANGED",
        details: {
          taskId: routine.taskId,
          fromActive: routine.isActive,
          toActive: input.isActive,
        },
      },
    });

    return { success: true, routineId: routine.id };
  });
}

export async function listRoutineOwnerIds() {
  const routines = await prisma.routine.findMany({
    where: { isActive: true },
    distinct: ["userId"],
    select: { userId: true },
  });

  return routines.map((routine) => routine.userId);
}

export async function listRoutinesForGeneration(
  userId: string,
  routineId?: string,
) {
  return prisma.routine.findMany({
    where: {
      userId,
      isActive: true,
      ...(routineId ? { id: routineId } : {}),
      task: { kind: "REUSABLE", status: { not: "ARCHIVED" } },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      task: {
        select: {
          id: true,
          title: true,
          category: { select: { color: true } },
        },
      },
      schedules: {
        where: { isActive: true },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}

export async function createRoutineOccurrenceWithHistory(input: {
  userId: string;
  routineId: string;
  routineScheduleId: string;
  occurrenceDate: Date;
  startsAt: Date;
  endsAt: Date;
}): Promise<CreateRoutineOccurrenceResult> {
  return prisma.$transaction(async (transaction) => {
    const schedule = await transaction.routineSchedule.findFirst({
      where: {
        id: input.routineScheduleId,
        isActive: true,
        routine: {
          id: input.routineId,
          userId: input.userId,
          isActive: true,
          startDate: { lte: input.occurrenceDate },
          OR: [{ endDate: null }, { endDate: { gte: input.occurrenceDate } }],
          task: { kind: "REUSABLE", status: { not: "ARCHIVED" } },
        },
      },
      select: {
        id: true,
        routine: {
          select: {
            id: true,
            task: {
              select: {
                id: true,
                title: true,
                kind: true,
                category: { select: { color: true } },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return { status: "excluded" };
    }

    const exclusion = await transaction.routineOccurrenceExclusion.findFirst({
      where: {
        userId: input.userId,
        routineScheduleId: schedule.id,
        occurrenceDate: input.occurrenceDate,
      },
      select: { id: true },
    });

    if (exclusion) {
      return { status: "excluded" };
    }

    const existing = await transaction.dailyPlanItem.findUnique({
      where: {
        routineScheduleId_routineOccurrenceDate: {
          routineScheduleId: schedule.id,
          routineOccurrenceDate: input.occurrenceDate,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return { status: "existing" };
    }

    const overlap = await transaction.dailyPlanItem.findFirst({
      where: {
        userId: input.userId,
        plannedDate: input.occurrenceDate,
        status: { in: ["PLANNED", "IN_PROGRESS"] },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt },
      },
      select: { task: { select: { title: true } } },
    });

    if (overlap) {
      return {
        status: "conflict",
        conflictingTaskTitle: overlap.task.title,
      };
    }

    const positionResult = await transaction.dailyPlanItem.aggregate({
      where: { userId: input.userId, plannedDate: input.occurrenceDate },
      _max: { position: true },
    });

    const created = await transaction.dailyPlanItem.createMany({
      data: {
        userId: input.userId,
        taskId: schedule.routine.task.id,
        routineScheduleId: schedule.id,
        routineOccurrenceDate: input.occurrenceDate,
        plannedDate: input.occurrenceDate,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        position: (positionResult._max.position ?? -1) + 1,
      },
      skipDuplicates: true,
    });

    if (created.count === 0) {
      return { status: "existing" };
    }

    const dailyPlanItem = await transaction.dailyPlanItem.findUniqueOrThrow({
      where: {
        routineScheduleId_routineOccurrenceDate: {
          routineScheduleId: schedule.id,
          routineOccurrenceDate: input.occurrenceDate,
        },
      },
      select: { id: true },
    });

    await transaction.historyEntry.create({
      data: {
        userId: input.userId,
        entityType: "DAILY_PLAN_ITEM",
        entityId: dailyPlanItem.id,
        action: "SCHEDULED",
        details: {
          source: "ROUTINE",
          routineId: schedule.routine.id,
          routineScheduleId: schedule.id,
          taskId: schedule.routine.task.id,
          taskTitle: schedule.routine.task.title,
          taskKind: schedule.routine.task.kind,
          plannedDate: input.occurrenceDate.toISOString().slice(0, 10),
          startsAt: input.startsAt.toISOString(),
          endsAt: input.endsAt.toISOString(),
        },
      },
    });

    return {
      status: "created",
      dailyPlanItemId: dailyPlanItem.id,
      title: schedule.routine.task.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      notes: null,
      categoryColor: schedule.routine.task.category?.color ?? null,
    };
  });
}

export async function listRoutineItemsForReconciliation(input: {
  userId: string;
  routineId: string;
  windowStartDate: Date;
  windowEndDate: Date;
}) {
  return prisma.dailyPlanItem.findMany({
    where: {
      userId: input.userId,
      status: "PLANNED",
      isRoutineException: false,
      routineOccurrenceDate: {
        gte: input.windowStartDate,
        lte: input.windowEndDate,
      },
      routineSchedule: { routineId: input.routineId },
    },
    select: {
      id: true,
      routineOccurrenceDate: true,
      startsAt: true,
      endsAt: true,
      notes: true,
      googleCalendarEventId: true,
      routineSchedule: {
        select: {
          id: true,
          isActive: true,
          startTime: true,
          endTime: true,
          routine: {
            select: {
              id: true,
              isActive: true,
              startDate: true,
              endDate: true,
              task: {
                select: {
                  id: true,
                  title: true,
                  kind: true,
                  status: true,
                  category: { select: { color: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function cancelRoutinePlannedItem(input: {
  userId: string;
  dailyPlanItemId: string;
  now: Date;
  reason: string;
}): Promise<RoutineCalendarChange | null> {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.dailyPlanItem.findFirst({
      where: {
        id: input.dailyPlanItemId,
        userId: input.userId,
        status: "PLANNED",
        isRoutineException: false,
      },
      select: {
        id: true,
        taskId: true,
        googleCalendarEventId: true,
        routineScheduleId: true,
      },
    });

    if (!item) {
      return null;
    }

    await transaction.dailyPlanItem.updateMany({
      where: {
        id: item.id,
        userId: input.userId,
        status: "PLANNED",
        isRoutineException: false,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: input.now,
        ...(item.googleCalendarEventId
          ? { calendarSyncStatus: "PENDING", calendarSyncError: null }
          : {}),
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: input.userId,
        entityType: "DAILY_PLAN_ITEM",
        entityId: item.id,
        action: "CANCELLED",
        details: {
          source: "ROUTINE",
          reason: input.reason,
          taskId: item.taskId,
          routineScheduleId: item.routineScheduleId,
          cancelledAt: input.now.toISOString(),
        },
      },
    });

    return item.googleCalendarEventId
      ? {
          operation: "delete",
          dailyPlanItemId: item.id,
          eventId: item.googleCalendarEventId,
        }
      : null;
  });
}

export async function updateRoutinePlannedItem(input: {
  userId: string;
  dailyPlanItemId: string;
  plannedDate: Date;
  startsAt: Date;
  endsAt: Date;
  title: string;
  categoryColor: string | null;
}): Promise<
  | { status: "updated"; calendarChange: RoutineCalendarChange | null }
  | { status: "unchanged" }
  | { status: "conflict"; conflictingTaskTitle: string }
> {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.dailyPlanItem.findFirst({
      where: {
        id: input.dailyPlanItemId,
        userId: input.userId,
        status: "PLANNED",
        isRoutineException: false,
      },
      select: {
        id: true,
        taskId: true,
        plannedDate: true,
        startsAt: true,
        endsAt: true,
        notes: true,
        googleCalendarEventId: true,
        routineScheduleId: true,
      },
    });

    if (!item) {
      return { status: "unchanged" };
    }

    if (
      item.plannedDate.getTime() === input.plannedDate.getTime() &&
      item.startsAt.getTime() === input.startsAt.getTime() &&
      item.endsAt.getTime() === input.endsAt.getTime()
    ) {
      return { status: "unchanged" };
    }

    const overlap = await transaction.dailyPlanItem.findFirst({
      where: {
        id: { not: item.id },
        userId: input.userId,
        plannedDate: input.plannedDate,
        status: { in: ["PLANNED", "IN_PROGRESS"] },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt },
      },
      select: { task: { select: { title: true } } },
    });

    if (overlap) {
      return {
        status: "conflict",
        conflictingTaskTitle: overlap.task.title,
      };
    }

    await transaction.dailyPlanItem.updateMany({
      where: {
        id: item.id,
        userId: input.userId,
        status: "PLANNED",
        isRoutineException: false,
      },
      data: {
        plannedDate: input.plannedDate,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(item.googleCalendarEventId
          ? { calendarSyncStatus: "PENDING", calendarSyncError: null }
          : {}),
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: input.userId,
        entityType: "DAILY_PLAN_ITEM",
        entityId: item.id,
        action: "RESCHEDULED",
        details: {
          source: "ROUTINE_UPDATED",
          routineScheduleId: item.routineScheduleId,
          taskId: item.taskId,
          before: {
            plannedDate: item.plannedDate.toISOString().slice(0, 10),
            startsAt: item.startsAt.toISOString(),
            endsAt: item.endsAt.toISOString(),
            notes: item.notes,
          },
          after: {
            plannedDate: input.plannedDate.toISOString().slice(0, 10),
            startsAt: input.startsAt.toISOString(),
            endsAt: input.endsAt.toISOString(),
            notes: item.notes,
          },
        },
      },
    });

    return {
      status: "updated",
      calendarChange: item.googleCalendarEventId
        ? {
            operation: "update",
            dailyPlanItemId: item.id,
            eventId: item.googleCalendarEventId,
            title: input.title,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            notes: item.notes,
            categoryColor: input.categoryColor,
          }
        : null,
    };
  });
}
