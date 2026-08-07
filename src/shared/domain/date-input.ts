const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateInput(value: string): Date | null {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

export function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysToDateInput(value: string, days: number): string {
  const date = parseDateInput(value);

  if (!date) {
    throw new Error("La fecha no es válida.");
  }

  date.setUTCDate(date.getUTCDate() + days);

  return formatDateInput(date);
}
