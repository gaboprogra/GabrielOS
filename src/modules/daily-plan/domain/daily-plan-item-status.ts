export const DAILY_PLAN_ITEM_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELLED",
] as const;

export type DailyPlanItemStatus = (typeof DAILY_PLAN_ITEM_STATUSES)[number];

export const DAILY_PLAN_ITEM_ACTIONS = [
  "START",
  "COMPLETE",
  "SKIP",
  "CANCEL",
  "REMOVE",
  "RESTORE_TO_PLANNED",
] as const;

export type DailyPlanItemAction = (typeof DAILY_PLAN_ITEM_ACTIONS)[number];
