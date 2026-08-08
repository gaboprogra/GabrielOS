import type { RoutineScheduleData } from "../infrastructure/routine-repository";

export function getRoutineSchedulesFromFormData(
  formData: FormData,
): Array<Partial<RoutineScheduleData>> {
  const days = formData.getAll("dayOfWeek");
  const starts = formData.getAll("startTime");
  const ends = formData.getAll("endTime");
  const length = Math.max(days.length, starts.length, ends.length);

  return Array.from({ length }, (_, index) => ({
    dayOfWeek: String(days[index] ?? "") as RoutineScheduleData["dayOfWeek"],
    startTime: String(starts[index] ?? ""),
    endTime: String(ends[index] ?? ""),
  }));
}
