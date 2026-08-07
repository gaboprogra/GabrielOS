import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { parseBoliviaDateTime } from "@/shared/domain/bolivia-date-time";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  test: {
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  },
});
