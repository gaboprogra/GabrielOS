const BOLIVIA_TIME_ZONE = "America/La_Paz";
const BOLIVIA_UTC_OFFSET = "-04:00";

const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function parseBoliviaDateTime(value: string): Date | null {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const date = new Date(`${value}:00.000${BOLIVIA_UTC_OFFSET}`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const reconstructedValue = [
    getPart(parts, "year"),
    "-",
    getPart(parts, "month"),
    "-",
    getPart(parts, "day"),
    "T",
    getPart(parts, "hour"),
    ":",
    getPart(parts, "minute"),
  ].join("");

  if (reconstructedValue !== value) {
    return null;
  }

  return date;
}
export function formatBoliviaDateTimeInput(date: Date | null): string {
  if (!date) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return [
    getPart(parts, "year"),
    "-",
    getPart(parts, "month"),
    "-",
    getPart(parts, "day"),
    "T",
    getPart(parts, "hour"),
    ":",
    getPart(parts, "minute"),
  ].join("");
}
export function formatBoliviaDateInput(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return [
    getPart(parts, "year"),
    "-",
    getPart(parts, "month"),
    "-",
    getPart(parts, "day"),
  ].join("");
}
