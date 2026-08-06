import { Task, TaskStatus } from "./task";

export function isTaskOverdue(task: Task, now: Date): boolean {
  if (task.dueAt === null) {
    return false;
  }

  if (
    task.status === TaskStatus.COMPLETED ||
    task.status === TaskStatus.ARCHIVED
  ) {
    return false;
  }

  return task.dueAt.getTime() < now.getTime();
}
