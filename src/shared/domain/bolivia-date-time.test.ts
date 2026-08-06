import { describe, expect, it } from "vitest";

import { parseBoliviaDateTime } from "./bolivia-date-time";

describe("parseBoliviaDateTime", () => {
  it("convierte una fecha de Bolivia a UTC", () => {
    const result = parseBoliviaDateTime("2026-08-10T19:30");

    expect(result?.toISOString()).toBe("2026-08-10T23:30:00.000Z");
  });

  it("rechaza una fecha inexistente", () => {
    const result = parseBoliviaDateTime("2026-02-30T19:30");

    expect(result).toBeNull();
  });

  it("rechaza un formato incompleto", () => {
    const result = parseBoliviaDateTime("2026-08-10");

    expect(result).toBeNull();
  });
});
