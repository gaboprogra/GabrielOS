import { describe, expect, it } from "vitest";

import { mapHexToGoogleCalendarColor } from "./google-calendar-event-color";

describe("mapHexToGoogleCalendarColor", () => {
  it.each([
    ["#3366CC", "BLUE"],
    ["#22AA66", "GREEN"],
    ["#D50000", "RED"],
    ["#AA66CC", "MAUVE"],
  ] as const)("convierte %s a %s", (hex, expected) => {
    expect(mapHexToGoogleCalendarColor(hex)).toBe(expected);
  });

  it("usa el color por defecto para valores ausentes o inválidos", () => {
    expect(mapHexToGoogleCalendarColor(null)).toBeNull();
    expect(mapHexToGoogleCalendarColor("not-a-color")).toBeNull();
  });
});
