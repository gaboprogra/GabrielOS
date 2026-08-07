import { changeCategoryArchiveSchema } from "../domain/change-category-archive-schema";
import { changeCategoryArchiveWithHistory } from "../infrastructure/category-repository";

type ChangeCategoryArchiveCommand = {
  userId: string;
  categoryId: unknown;
  action: unknown;
  now: Date;
};

export type ChangeCategoryArchiveResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function changeCategoryArchive(
  command: ChangeCategoryArchiveCommand,
): Promise<ChangeCategoryArchiveResult> {
  const validation = changeCategoryArchiveSchema.safeParse({
    categoryId: command.categoryId,
    action: command.action,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "La acción no es válida.",
    };
  }

  return changeCategoryArchiveWithHistory({
    userId: command.userId,
    categoryId: validation.data.categoryId,
    action: validation.data.action,
    now: command.now,
  });
}
