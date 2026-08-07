export const PROJECT_STATUSES = ["ACTIVE", "COMPLETED", "ARCHIVED"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_ACTIONS = [
  "COMPLETE",
  "REOPEN",
  "ARCHIVE",
  "RESTORE",
] as const;

export type ProjectStatusAction = (typeof PROJECT_STATUS_ACTIONS)[number];
