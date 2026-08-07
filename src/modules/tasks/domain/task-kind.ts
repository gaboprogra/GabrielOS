export const TASK_KINDS = ["ONE_TIME", "REUSABLE"] as const;

export type TaskKind = (typeof TASK_KINDS)[number];
