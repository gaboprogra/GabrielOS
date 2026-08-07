import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import { CategoryArchiveAction } from "../domain/change-category-archive-schema";

type CreateCategoryData = {
  userId: string;
  name: string;
  color: string;
};
type UpdateCategoryData = {
  userId: string;
  categoryId: string;
  name: string;
  color: string;
};

type ChangeCategoryArchiveData = {
  userId: string;
  categoryId: string;
  action: CategoryArchiveAction;
  now: Date;
};

export type CategoryRepositoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
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
export async function listArchivedCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      userId,
      isArchived: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      color: true,
      updatedAt: true,
    },
  });
}

export async function findCategoryForEdit(userId: string, categoryId: string) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });
}

export async function updateCategoryWithHistory(
  data: UpdateCategoryData,
): Promise<CategoryRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.findFirst({
      where: {
        id: data.categoryId,
        userId: data.userId,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: "La categoría no existe o está archivada.",
      };
    }

    const duplicate = await transaction.category.findFirst({
      where: {
        userId: data.userId,
        id: {
          not: category.id,
        },
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Ya existe otra categoría con ese nombre.",
      };
    }

    await transaction.category.update({
      where: {
        id: category.id,
      },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "CATEGORY",
        entityId: category.id,
        action: "UPDATED",
        details: {
          before: {
            name: category.name,
            color: category.color,
          },
          after: {
            name: data.name,
            color: data.color,
          },
        },
      },
    });

    return {
      success: true,
    };
  });
}

export async function changeCategoryArchiveWithHistory(
  data: ChangeCategoryArchiveData,
): Promise<CategoryRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.findFirst({
      where: {
        id: data.categoryId,
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
        isArchived: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: "La categoría no existe.",
      };
    }

    const shouldArchive = data.action === "ARCHIVE";

    if (category.isArchived === shouldArchive) {
      return {
        success: false,
        error: shouldArchive
          ? "La categoría ya está archivada."
          : "La categoría ya está activa.",
      };
    }

    await transaction.category.update({
      where: {
        id: category.id,
      },
      data: {
        isArchived: shouldArchive,
      },
    });

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "CATEGORY",
        entityId: category.id,
        action: shouldArchive ? "ARCHIVED" : "RESTORED",
        details: {
          name: category.name,
          changedAt: data.now.toISOString(),
        },
      },
    });

    return {
      success: true,
    };
  });
}
