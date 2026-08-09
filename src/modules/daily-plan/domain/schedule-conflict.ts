export type BlockingScheduleItem = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
};

export type SuggestedScheduleSlot = {
  startsAt: Date;
  endsAt: Date;
};

export type ScheduleConflict = {
  item: BlockingScheduleItem;
  requestedDurationMinutes: number;
  suggestedSlot: SuggestedScheduleSlot | null;
};

export type ScheduleOperationFailure =
  | {
      success: false;
      reason: "SCHEDULE_CONFLICT";
      error: string;
      conflict: ScheduleConflict;
    }
  | {
      success: false;
      reason: "ERROR";
      error: string;
    };

type FindScheduleConflictInput = {
  startsAt: Date;
  endsAt: Date;
  latestEnd: Date;
  blockingItems: ReadonlyArray<BlockingScheduleItem>;
  excludedItemId?: string;
};

function overlaps(
  startsAt: Date,
  endsAt: Date,
  item: BlockingScheduleItem,
): boolean {
  return (
    item.startsAt.getTime() < endsAt.getTime() &&
    item.endsAt.getTime() > startsAt.getTime()
  );
}

export function findScheduleConflict({
  startsAt,
  endsAt,
  latestEnd,
  blockingItems,
  excludedItemId,
}: FindScheduleConflictInput): ScheduleConflict | null {
  const durationMilliseconds = endsAt.getTime() - startsAt.getTime();

  if (durationMilliseconds <= 0) {
    return null;
  }

  const relevantItems = blockingItems
    .filter((item) => item.id !== excludedItemId)
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
  const conflictingItem = relevantItems.find((item) =>
    overlaps(startsAt, endsAt, item),
  );

  if (!conflictingItem) {
    return null;
  }

  let candidateStart = startsAt;
  let suggestedSlot: SuggestedScheduleSlot | null = null;

  while (candidateStart.getTime() < latestEnd.getTime()) {
    const candidateEnd = new Date(
      candidateStart.getTime() + durationMilliseconds,
    );

    if (candidateEnd.getTime() > latestEnd.getTime()) {
      break;
    }

    const candidateConflict = relevantItems.find((item) =>
      overlaps(candidateStart, candidateEnd, item),
    );

    if (!candidateConflict) {
      suggestedSlot = {
        startsAt: candidateStart,
        endsAt: candidateEnd,
      };
      break;
    }

    candidateStart = new Date(candidateConflict.endsAt);
  }

  return {
    item: conflictingItem,
    requestedDurationMinutes: Math.round(durationMilliseconds / 60_000),
    suggestedSlot,
  };
}
