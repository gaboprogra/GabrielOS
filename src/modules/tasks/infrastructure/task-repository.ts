import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import { getTaskStatusTransition } from "../domain/get-task-status-transition";
import type { TaskStatus, TaskStatusAction } from "../domain/task";
import { TaskKind } from "../domain/task-kind";

type CreateTaskData = {
  userId: string;
  categoryId: string | null;
  projectId: string | null;
  title: string;
  description: string | null;
  kind: TaskKind;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt: Date | null;
  estimatedMinutes: number | null;
};

type TaskRelationsValidation = {
  categoryIsValid: boolean;
  projectIsValid: boolean;
};
type ChangeTaskStatusData = {
  userId: string;
  taskId: string;
  action: TaskStatusAction;
  now: Date;
};

export type ChangeTaskStatusRepositoryResult =
  | {
      success: true;
      nextStatus: TaskStatus;
    }
  | {
      success: false;
      error: string;
    };
type UpdateTaskData = {
  userId: string;
  taskId: string;
  categoryId: string | null;
  projectId: string | null;
  title: string;
  description: string | null;
  kind: TaskKind;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt: Date | null;
  estimatedMinutes: number | null;
};

export type UpdateTaskRepositoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };
const taskListSelect = {
  id: true,
  title: true,
  description: true,
  kind: true,
  status: true,
  priority: true,
  dueAt: true,
  estimatedMinutes: true,
  completedAt: true,
  archivedAt: true,
  createdAt: true,

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
} as const;
export async function validateTaskRelations(
  userId: string,
  categoryId: string | null,
  projectId: string | null,
): Promise<TaskRelationsValidation> {
  const [category, project] = await Promise.all([
    categoryId
      ? prisma.category.findFirst({
          where: {
            id: categoryId,
            userId,
            isArchived: false,
          },
          select: {
            id: true,
          },
        })
      : Promise.resolve(null),

    projectId
      ? prisma.project.findFirst({
          where: {
            id: projectId,
            userId,
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    categoryIsValid: categoryId === null || category !== null,
    projectIsValid: projectId === null || project !== null,
  };
}

export async function createTaskWithHistory(data: CreateTaskData) {
  return prisma.$transaction(async (transaction) => {
    const task = await transaction.task.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueAt: data.dueAt,
        estimatedMinutes: data.estimatedMinutes,
        kind: data.kind,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "TASK",
        entityId: task.id,
        action: "CREATED",
        details: {
          title: task.title,
          kind: data.kind,
          priority: task.priority,
          categoryId: task.categoryId,
          projectId: task.projectId,
          dueAt: task.dueAt?.toISOString() ?? null,
          estimatedMinutes: task.estimatedMinutes,
        },
      },
    });

    return task;
  });
}

export async function listActiveTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      status: {
        not: "ARCHIVED",
      },
    },
    orderBy: [
      {
        dueAt: {
          sort: "asc",
          nulls: "last",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    take: 100,
    select: taskListSelect,
  });
}

export async function listRecentArchivedTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      status: "ARCHIVED",
    },
    orderBy: {
      archivedAt: "desc",
    },
    take: 5,
    select: taskListSelect,
  });
}

export async function countArchivedTasks(userId: string) {
  return prisma.task.count({
    where: {
      userId,
      status: "ARCHIVED",
    },
  });
}

export async function listArchivedTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      status: "ARCHIVED",
    },
    orderBy: {
      archivedAt: "desc",
    },
    select: taskListSelect,
  });
}
export async function changeTaskStatusWithHistory(
  data: ChangeTaskStatusData,
): Promise<ChangeTaskStatusRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const task = await transaction.task.findFirst({
      where: {
        id: data.taskId,
        userId: data.userId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        kind: true,
      },
    });

    if (!task) {
      return {
        success: false,
        error: "La tarea no existe.",
      };
    }

    const transition = getTaskStatusTransition(
      task.status,
      data.action,
      data.now,
      task.kind,
    );

    if (!transition.success) {
      return transition;
    }

    const updateResult = await transaction.task.updateMany({
      where: {
        id: task.id,
        userId: data.userId,
        status: task.status,
      },
      data: transition.patch,
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        error:
          "La tarea cambió mientras se procesaba la operación. Intenta nuevamente.",
      };
    }

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "TASK",
        entityId: task.id,
        action: transition.historyAction,
        details: {
          title: task.title,
          command: data.action,
          fromStatus: task.status,
          toStatus: transition.patch.status,
          changedAt: data.now.toISOString(),
        },
      },
    });

    return {
      success: true,
      nextStatus: transition.patch.status,
    };
  });
}
export async function findTaskForEdit(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      status: {
        not: "ARCHIVED",
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      kind: true,
      priority: true,
      dueAt: true,
      estimatedMinutes: true,
      categoryId: true,
      projectId: true,
      status: true,
    },
  });
}

export async function updateTaskWithHistory(
  data: UpdateTaskData,
): Promise<UpdateTaskRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const currentTask = await transaction.task.findFirst({
      where: {
        id: data.taskId,
        userId: data.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        kind: true,
        priority: true,
        dueAt: true,
        estimatedMinutes: true,
        categoryId: true,
        projectId: true,
        status: true,
        completedAt: true,
      },
    });

    if (!currentTask) {
      return {
        success: false,
        error: "La tarea no existe.",
      };
    }

    if (currentTask.status === "ARCHIVED") {
      return {
        success: false,
        error: "Una tarea archivada debe restaurarse antes de editarla.",
      };
    }

    const updateResult = await transaction.task.updateMany({
      where: {
        id: currentTask.id,
        userId: data.userId,
        status: {
          not: "ARCHIVED",
        },
      },
      data: {
        title: data.title,
        description: data.description,
        kind: data.kind,
        categoryId: data.categoryId,
        projectId: data.projectId,
        priority: data.priority,
        dueAt: data.dueAt,
        estimatedMinutes: data.estimatedMinutes,

        ...(data.kind === "REUSABLE"
          ? {
              status: "PENDING" as const,
              completedAt: null,
            }
          : {}),
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        error:
          "La tarea cambió mientras se procesaba la edición. Intenta nuevamente.",
      };
    }

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "TASK",
        entityId: currentTask.id,
        action: "UPDATED",
        details: {
          before: {
            title: currentTask.title,
            description: currentTask.description,
            priority: currentTask.priority,
            categoryId: currentTask.categoryId,
            projectId: currentTask.projectId,
            dueAt: currentTask.dueAt?.toISOString() ?? null,
            estimatedMinutes: currentTask.estimatedMinutes,
          },
          after: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            categoryId: data.categoryId,
            projectId: data.projectId,
            dueAt: data.dueAt?.toISOString() ?? null,
            estimatedMinutes: data.estimatedMinutes,
          },
        },
      },
    });

    return {
      success: true,
    };
  });
}
export async function listSchedulableTaskOptions(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,

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
    orderBy: [
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      kind: true,
      priority: true,
      estimatedMinutes: true,

      category: {
        select: {
          name: true,
        },
      },

      project: {
        select: {
          name: true,
        },
      },
    },
  });
}
