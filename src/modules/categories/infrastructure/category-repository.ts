import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

type CreateCategoryData = {
  userId: string;
  name: string;
  color: string;
};

export async function findActiveCategoryByName(userId: string, name: string) {
  return prisma.category.findFirst({
    where: {
      userId,
      name: {
        equals: name,
        mode: "insensitive",
      },
      isArchived: false,
    },
    select: {
      id: true,
    },
  });
}

export async function createCategoryWithHistory(data: CreateCategoryData) {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        color: data.color,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "CATEGORY",
        entityId: category.id,
        action: "CREATED",
        details: {
          name: category.name,
          color: category.color,
        },
      },
    });

    return category;
  });
}

export async function listActiveCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      color: true,
      createdAt: true,
    },
  });
}
