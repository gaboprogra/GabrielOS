import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

export async function getDashboardSource(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const [user, dailyPlanItems] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.dailyPlanItem.findMany({
      where: {
        userId,
        plannedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [{ plannedDate: "asc" }, { startsAt: "asc" }],
      select: {
        id: true,
        plannedDate: true,
        startsAt: true,
        endsAt: true,
        status: true,
        task: {
          select: {
            id: true,
            title: true,
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
    }),
  ]);

  if (!user) {
    throw new Error("No se encontró el usuario del dashboard.");
  }

  return { user, dailyPlanItems };
}
