export const GOOGLE_CALENDAR_EVENT_COLORS = [
  "PALE_BLUE",
  "PALE_GREEN",
  "MAUVE",
  "PALE_RED",
  "YELLOW",
  "ORANGE",
  "CYAN",
  "GRAY",
  "BLUE",
  "GREEN",
  "RED",
] as const;

export type GoogleCalendarEventColor =
  (typeof GOOGLE_CALENDAR_EVENT_COLORS)[number];

const COLOR_PALETTE: Array<{
  name: GoogleCalendarEventColor;
  rgb: readonly [number, number, number];
}> = [
  { name: "PALE_BLUE", rgb: [164, 194, 244] },
  { name: "PALE_GREEN", rgb: [167, 255, 235] },
  { name: "MAUVE", rgb: [170, 102, 204] },
  { name: "PALE_RED", rgb: [255, 138, 128] },
  { name: "YELLOW", rgb: [251, 215, 91] },
  { name: "ORANGE", rgb: [255, 183, 77] },
  { name: "CYAN", rgb: [70, 214, 219] },
  { name: "GRAY", rgb: [224, 224, 224] },
  { name: "BLUE", rgb: [84, 110, 214] },
  { name: "GREEN", rgb: [51, 182, 121] },
  { name: "RED", rgb: [213, 0, 0] },
];

const HEX_COLOR_PATTERN = /^#?([0-9a-f]{6})$/i;

export function mapHexToGoogleCalendarColor(
  hexColor: string | null | undefined,
): GoogleCalendarEventColor | null {
  if (!hexColor) {
    return null;
  }

  const match = HEX_COLOR_PATTERN.exec(hexColor.trim());

  if (!match?.[1]) {
    return null;
  }

  const value = Number.parseInt(match[1], 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  let nearest = COLOR_PALETTE[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of COLOR_PALETTE) {
    const distance =
      (red - candidate.rgb[0]) ** 2 +
      (green - candidate.rgb[1]) ** 2 +
      (blue - candidate.rgb[2]) ** 2;

    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest?.name ?? null;
}
