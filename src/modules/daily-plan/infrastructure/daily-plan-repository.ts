import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

import { getDailyPlanItemTransition } from "../domain/get-daily-plan-item-transition";
import type { DailyPlanItemAction } from "../domain/daily-plan-item-status";

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
      taskTitle: string;
      startsAt: Date;
      endsAt: Date;
      notes: string | null;
    }
  | {
      success: false;
      error: string;
    };

type ChangeDailyPlanItemStatusData = {
  userId: string;
  dailyPlanItemId: string;
  action: DailyPlanItemAction;
  now: Date;
};

export type ChangeDailyPlanItemStatusResult =
  | {
      success: true;
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
        OR: [
          {
            kind: "REUSABLE",
            status: {
              not: "ARCHIVED",
            },
          },
          {
            kind: "ONE_TIME",
            status: {
              in: ["PENDING", "IN_PROGRESS"],
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        kind: true,
        status: true,
      },
    });

    if (!task) {
      return {
        success: false,
        error: "La tarea no existe o ya no puede programarse.",
      };
    }

    /*
     * Una tarea ONE_TIME representa un trabajo concreto.
     * No debe tener varias ejecuciones activas simultáneamente.
     * Si se desea moverla de día/hora, se hará mediante reprogramación.
     */
    if (task.kind === "ONE_TIME") {
      const existingTaskSchedule = await transaction.dailyPlanItem.findFirst({
        where: {
          userId: data.userId,
          taskId: task.id,
          status: {
            in: ["PLANNED", "IN_PROGRESS"],
          },
        },
        select: {
          id: true,
          plannedDate: true,
          startsAt: true,
        },
      });

      if (existingTaskSchedule) {
        return {
          success: false,
          error:
            "Esta tarea de una sola vez ya tiene una programación activa. Reprográmala en lugar de crear otra.",
        };
      }
    }

    /*
     * Evita solapamientos de horario.
     * Se permite que una actividad termine exactamente cuando comienza otra.
     */
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
          taskKind: task.kind,
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
      taskTitle: task.title,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      notes: data.notes,
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
          kind: true,
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

export async function changeDailyPlanItemStatusWithHistory(
  data: ChangeDailyPlanItemStatusData,
): Promise<ChangeDailyPlanItemStatusResult> {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.dailyPlanItem.findFirst({
      where: {
        id: data.dailyPlanItemId,
        userId: data.userId,
      },
      select: {
        id: true,
        status: true,
        taskId: true,
        plannedDate: true,
        startsAt: true,
        endsAt: true,

        task: {
          select: {
            id: true,
            title: true,
            kind: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      return {
        success: false,
        error: "La actividad no existe.",
      };
    }

    const transition = getDailyPlanItemTransition(
      item.status,
      data.action,
      data.now,
    );

    if (!transition.success) {
      return transition;
    }

    /*
     * Primero cambia la ejecución concreta.
     * El filtro por estado actual evita aplicar dos veces una acción
     * si llegan peticiones concurrentes.
     */
    const updateResult = await transaction.dailyPlanItem.updateMany({
      where: {
        id: item.id,
        userId: data.userId,
        status: item.status,
      },
      data: transition.patch,
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        error: "La actividad cambió mientras se procesaba la operación.",
      };
    }

    /*
     * REGLA PRINCIPAL:
     *
     * ONE_TIME:
     *   DailyPlanItem representa la ejecución de una tarea que sí termina.
     *   START/COMPLETE pueden modificar el estado global de Task.
     *
     * REUSABLE:
     *   Task es una plantilla disponible permanentemente en el banco.
     *   Solo cambia DailyPlanItem; Task no se completa ni se pone en progreso.
     */

    if (item.task.kind === "ONE_TIME") {
      if (data.action === "START" && item.task.status === "PENDING") {
        const taskUpdate = await transaction.task.updateMany({
          where: {
            id: item.task.id,
            userId: data.userId,
            status: "PENDING",
          },
          data: {
            status: "IN_PROGRESS",
          },
        });

        if (taskUpdate.count === 1) {
          await transaction.historyEntry.create({
            data: {
              userId: data.userId,
              entityType: "TASK",
              entityId: item.task.id,
              action: "STATUS_CHANGED",
              details: {
                fromStatus: "PENDING",
                toStatus: "IN_PROGRESS",
                source: "DAILY_PLAN_ITEM",
                dailyPlanItemId: item.id,
              },
            },
          });
        }
      }

      if (data.action === "COMPLETE") {
        if (
          item.task.status !== "ARCHIVED" &&
          item.task.status !== "COMPLETED"
        ) {
          const taskUpdate = await transaction.task.updateMany({
            where: {
              id: item.task.id,
              userId: data.userId,
              status: {
                in: ["PENDING", "IN_PROGRESS"],
              },
            },
            data: {
              status: "COMPLETED",
              completedAt: data.now,
            },
          });

          if (taskUpdate.count === 1) {
            await transaction.historyEntry.create({
              data: {
                userId: data.userId,
                entityType: "TASK",
                entityId: item.task.id,
                action: "COMPLETED",
                details: {
                  source: "DAILY_PLAN_ITEM",
                  dailyPlanItemId: item.id,
                  completedAt: data.now.toISOString(),
                },
              },
            });
          }
        }

        /*
         * Esto es defensivo para datos antiguos que pudieran tener
         * más de una programación activa de una ONE_TIME.
         * Con la regla nueva de creación ya no deberían generarse duplicados.
         */
        const otherItems = await transaction.dailyPlanItem.findMany({
          where: {
            userId: data.userId,
            taskId: item.task.id,
            id: {
              not: item.id,
            },
            status: {
              in: ["PLANNED", "IN_PROGRESS"],
            },
          },
          select: {
            id: true,
          },
        });

        if (otherItems.length > 0) {
          const otherItemIds = otherItems.map((otherItem) => otherItem.id);

          await transaction.dailyPlanItem.updateMany({
            where: {
              userId: data.userId,
              id: {
                in: otherItemIds,
              },
              status: {
                in: ["PLANNED", "IN_PROGRESS"],
              },
            },
            data: {
              status: "CANCELLED",
              cancelledAt: data.now,
            },
          });

          await Promise.all(
            otherItemIds.map((otherItemId) =>
              transaction.historyEntry.create({
                data: {
                  userId: data.userId,
                  entityType: "DAILY_PLAN_ITEM",
                  entityId: otherItemId,
                  action: "CANCELLED",
                  details: {
                    reason: "TASK_COMPLETED_IN_ANOTHER_PLAN_ITEM",
                    taskId: item.task.id,
                    completedDailyPlanItemId: item.id,
                    cancelledAt: data.now.toISOString(),
                  },
                },
              }),
            ),
          );
        }
      }

      if (
        (data.action === "SKIP" || data.action === "CANCEL") &&
        item.task.status === "IN_PROGRESS"
      ) {
        const taskUpdate = await transaction.task.updateMany({
          where: {
            id: item.task.id,
            userId: data.userId,
            status: "IN_PROGRESS",
          },
          data: {
            status: "PENDING",
            completedAt: null,
          },
        });

        if (taskUpdate.count === 1) {
          await transaction.historyEntry.create({
            data: {
              userId: data.userId,
              entityType: "TASK",
              entityId: item.task.id,
              action: "STATUS_CHANGED",
              details: {
                fromStatus: "IN_PROGRESS",
                toStatus: "PENDING",
                source: "DAILY_PLAN_ITEM",
                dailyPlanItemId: item.id,
              },
            },
          });
        }
      }
    }

    /*
     * Siempre se registra la acción de la ejecución.
     * En REUSABLE este es el historial principal:
     * cada DailyPlanItem conserva qué ocurrió en cada ocasión.
     */
    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "DAILY_PLAN_ITEM",
        entityId: item.id,
        action: transition.historyAction,
        details: {
          taskId: item.task.id,
          taskTitle: item.task.title,
          taskKind: item.task.kind,
          command: data.action,
          fromStatus: item.status,
          toStatus: transition.patch.status,
          changedAt: data.now.toISOString(),
        },
      },
    });

    return {
      success: true,
    };
  });
}
export async function markCalendarSyncSucceeded(
  userId: string,
  dailyPlanItemId: string,
  eventId: string,
  now: Date,
) {
  await prisma.dailyPlanItem.updateMany({
    where: {
      id: dailyPlanItemId,
      userId,
    },

    data: {
      googleCalendarEventId: eventId,
      calendarSyncStatus: "SYNCED",
      calendarSyncError: null,
      calendarSyncedAt: now,
    },
  });
}

export async function markCalendarSyncFailed(
  userId: string,
  dailyPlanItemId: string,
  error: string,
) {
  await prisma.dailyPlanItem.updateMany({
    where: {
      id: dailyPlanItemId,
      userId,
    },

    data: {
      calendarSyncStatus: "FAILED",
      calendarSyncError: error,
    },
  });
}
