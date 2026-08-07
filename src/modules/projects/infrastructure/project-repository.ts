import "server-only";
import { getProjectStatusTransition } from "../domain/get-project-status-transition";
import type {
  ProjectStatus,
  ProjectStatusAction,
} from "../domain/project-status";
import { prisma } from "@/infrastructure/database/prisma";

type CreateProjectData = {
  userId: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  dueDate: Date | null;
};
type UpdateProjectData = {
  userId: string;
  projectId: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  dueDate: Date | null;
};

type ChangeProjectStatusData = {
  userId: string;
  projectId: string;
  action: ProjectStatusAction;
  now: Date;
};

export type ProjectRepositoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export type ChangeProjectStatusRepositoryResult =
  | {
      success: true;
      nextStatus: ProjectStatus;
    }
  | {
      success: false;
      error: string;
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
      status: {
        not: "ARCHIVED",
      },
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
      completedAt: true,
      archivedAt: true,
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
export async function listArchivedProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
      status: "ARCHIVED",
    },
    orderBy: {
      archivedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      archivedAt: true,
    },
  });
}

export async function findProjectForEdit(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      status: {
        not: "ARCHIVED",
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      dueDate: true,
      status: true,
    },
  });
}

export async function updateProjectWithHistory(
  data: UpdateProjectData,
): Promise<ProjectRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const project = await transaction.project.findFirst({
      where: {
        id: data.projectId,
        userId: data.userId,
        status: {
          not: "ARCHIVED",
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        dueDate: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: "El proyecto no existe o está archivado.",
      };
    }

    const duplicate = await transaction.project.findFirst({
      where: {
        userId: data.userId,
        id: {
          not: project.id,
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
        error: "Ya existe otro proyecto con ese nombre.",
      };
    }

    await transaction.project.update({
      where: {
        id: project.id,
      },
      data: {
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
        action: "UPDATED",
        details: {
          before: {
            name: project.name,
            description: project.description,
            startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
            dueDate: project.dueDate?.toISOString().slice(0, 10) ?? null,
          },
          after: {
            name: data.name,
            description: data.description,
            startDate: data.startDate?.toISOString().slice(0, 10) ?? null,
            dueDate: data.dueDate?.toISOString().slice(0, 10) ?? null,
          },
        },
      },
    });

    return {
      success: true,
    };
  });
}

export async function changeProjectStatusWithHistory(
  data: ChangeProjectStatusData,
): Promise<ChangeProjectStatusRepositoryResult> {
  return prisma.$transaction(async (transaction) => {
    const project = await transaction.project.findFirst({
      where: {
        id: data.projectId,
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: "El proyecto no existe.",
      };
    }

    const transition = getProjectStatusTransition(
      project.status,
      data.action,
      data.now,
    );

    if (!transition.success) {
      return transition;
    }

    const result = await transaction.project.updateMany({
      where: {
        id: project.id,
        userId: data.userId,
        status: project.status,
      },
      data: transition.patch,
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "El proyecto cambió mientras se procesaba la operación.",
      };
    }

    await transaction.historyEntry.create({
      data: {
        userId: data.userId,
        entityType: "PROJECT",
        entityId: project.id,
        action: transition.historyAction,
        details: {
          name: project.name,
          command: data.action,
          fromStatus: project.status,
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
