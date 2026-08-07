-- CreateEnum
CREATE TYPE "TaskKind" AS ENUM ('ONE_TIME', 'REUSABLE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "kind" "TaskKind" NOT NULL DEFAULT 'ONE_TIME';
