import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL no está configurada. Revisa el archivo .env.",
    );
  }

  return databaseUrl;
}

const adapter = new PrismaNeon({
  connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: {
      email: "gabriel@gabrielos.local",
    },
    update: {
      name: "Gabriel",
      timezone: "America/La_Paz",
    },
    create: {
      email: "gabriel@gabrielos.local",
      name: "Gabriel",
      timezone: "America/La_Paz",
    },
  });

  console.log(`Usuario inicial preparado: ${user.name} (${user.id})`);
}

main()
  .catch((error: unknown) => {
    console.error("No se pudo preparar la base de datos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
