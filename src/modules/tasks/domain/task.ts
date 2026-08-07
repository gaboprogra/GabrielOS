export const TASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_ACTIONS = [
  "START",
  "COMPLETE",
  "ARCHIVE",
  "RESTORE",
] as const;

export type TaskStatusAction = (typeof TASK_STATUS_ACTIONS)[number];
