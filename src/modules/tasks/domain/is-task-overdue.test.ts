import { describe, expect, it } from "vitest";

import { isTaskOverdue } from "./is-task-overdue";
import { Task, TaskStatus } from "./task";

const now = new Date("2026-08-06T12:00:00.000Z");

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Primera tarea",
    status: TaskStatus.PENDING,
    dueAt: new Date("2026-08-06T11:00:00.000Z"),
    completedAt: null,
    archivedAt: null,
    createdAt: new Date("2026-08-05T12:00:00.000Z"),
    updatedAt: new Date("2026-08-05T12:00:00.000Z"),
    ...overrides,
  };
}

describe("isTaskOverdue", () => {
  it("returns false when the task has no due date", () => {
    expect(isTaskOverdue(createTask({ dueAt: null }), now)).toBe(false);
  });

  it("returns true for an overdue pending task", () => {
    expect(isTaskOverdue(createTask(), now)).toBe(true);
  });

  it("returns true for an overdue task in progress", () => {
    const task = createTask({ status: TaskStatus.IN_PROGRESS });

    expect(isTaskOverdue(task, now)).toBe(true);
  });

  it("returns false for a completed task", () => {
    const task = createTask({
      status: TaskStatus.COMPLETED,
      completedAt: new Date("2026-08-06T11:30:00.000Z"),
    });

    expect(isTaskOverdue(task, now)).toBe(false);
  });

  it("returns false for an archived task", () => {
    const task = createTask({
      status: TaskStatus.ARCHIVED,
      archivedAt: new Date("2026-08-06T11:30:00.000Z"),
    });

    expect(isTaskOverdue(task, now)).toBe(false);
  });

  it("returns false when the due date is later than now", () => {
    const task = createTask({
      dueAt: new Date("2026-08-06T13:00:00.000Z"),
    });

    expect(isTaskOverdue(task, now)).toBe(false);
  });

  it("returns false when the due date is exactly now", () => {
    const task = createTask({ dueAt: now });

    expect(isTaskOverdue(task, now)).toBe(false);
  });
});
