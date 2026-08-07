import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

type CreateDailyPlanItemData = {
  userId: string;
  taskId: string;
  plannedDate: Date;
  startsAt: Date;
  endsAt: Date;
  notes: string | null;
};

export type CreateDailyPlanItemResult =
  | {
      success: true;
      dailyPlanItemId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createDailyPlanItemWithHistory(
  data: CreateDailyPlanItemData,
): Promise<CreateDailyPlanItemResult> {
  return prisma.$transaction(async (transaction) => {
    const task = await transaction.task.findFirst({
      where: {
        id: data.taskId,
        userId: data.userId,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!task) {
      return {
        success: false,
        error: "La tarea no existe o ya no puede programarse.",
      };
    }

    const existingTaskSchedule = await transaction.dailyPlanItem.findFirst({
      where: {
        userId: data.userId,
        taskId: task.id,
        plannedDate: data.plannedDate,
        status: {
          in: ["PLANNED", "IN_PROGRESS"],
        },
      },
      select: {
        id: true,
      },
    });

    if (existingTaskSchedule) {
      return {
        success: false,
        error: "Esta tarea ya está programada para ese día.",
      };
    }

    const overlappingItem = await transaction.dailyPlanItem.findFirst({
      where: {
        userId: data.userId,
        plannedDate: data.plannedDate,
        status: {
          in: ["PLANNED", "IN_PROGRESS"],
        },
        startsAt: {
          lt: data.endsAt,
        },
        endsAt: {
          gt: data.startsAt,
        },
      },
      select: {
        id: true,
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    if (overlappingItem) {
      return {
        success: false,
        error: `El horario se cruza con "${overlappingItem.task.title}".`,
      };
    }

    const positionResult = await transaction.dailyPlanItem.aggregate({
      where: {
        userId: data.userId,
        plannedDate: data.plannedDate,
      },
      _max: {
        position: true,
      },
    });

    const position = (positionResult._max.position ?? -1) + 1;

    const dailyPlanItem = await transaction.dailyPlanItem.create({
      data: {
        userId: data.userId,
        taskId: task.id,
        plannedDate: data.plannedDate,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        notes: data.notes,
        position,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "DAILY_PLAN_ITEM",
        entityId: dailyPlanItem.id,
        action: "SCHEDULED",
        details: {
          taskId: task.id,
          taskTitle: task.title,
          plannedDate: data.plannedDate.toISOString().slice(0, 10),
          startsAt: data.startsAt.toISOString(),
          endsAt: data.endsAt.toISOString(),
          notes: data.notes,
        },
      },
    });

    return {
      success: true,
      dailyPlanItemId: dailyPlanItem.id,
    };
  });
}
export async function listDailyPlanItemsByDate(
  userId: string,
  plannedDate: Date,
) {
  return prisma.dailyPlanItem.findMany({
    where: {
      userId,
      plannedDate,
    },

    orderBy: [
      {
        startsAt: "asc",
      },
      {
        position: "asc",
      },
    ],

    select: {
      id: true,
      plannedDate: true,
      startsAt: true,
      endsAt: true,
      status: true,
      position: true,
      notes: true,
      completedAt: true,
      skippedAt: true,
      cancelledAt: true,

      task: {
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          estimatedMinutes: true,

          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },

          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
