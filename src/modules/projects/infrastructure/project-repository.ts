import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

type CreateProjectData = {
  userId: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  dueDate: Date | null;
};

export async function findProjectByName(userId: string, name: string) {
  return prisma.project.findFirst({
    where: {
      userId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createProjectWithHistory(data: CreateProjectData) {
  return prisma.$transaction(async (transaction) => {
    const project = await transaction.project.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "PROJECT",
        entityId: project.id,
        action: "CREATED",
        details: {
          name: project.name,
          description: project.description,
          startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
          dueDate: project.dueDate?.toISOString().slice(0, 10) ?? null,
        },
      },
    });

    return project;
  });
}

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      dueDate: true,
      createdAt: true,
    },
  });
}
export async function listActiveProjectOptions(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}
