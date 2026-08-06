import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

type CreateTaskData = {
  userId: string;
  categoryId: string | null;
  projectId: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt: Date | null;
  estimatedMinutes: number | null;
};

type TaskRelationsValidation = {
  categoryIsValid: boolean;
  projectIsValid: boolean;
};

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
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueAt: true,
      estimatedMinutes: true,
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
    },
  });
}
