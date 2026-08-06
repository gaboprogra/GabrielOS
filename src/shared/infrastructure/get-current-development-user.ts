import "server-only";

import { prisma } from "@/infrastructure/database/prisma";

const DEVELOPMENT_USER_EMAIL = "gabriel@gabrielos.local";

export async function getCurrentDevelopmentUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("No existe el usuario inicial. Ejecuta: pnpm db:seed");
  }

  return user.id;
}
