import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/shared/**/*.ts",
        "src/core/domain/formulas.ts",
        "src/adapters/infrastructure/**/*.ts",
        "src/adapters/ui/primitives/**/*.{ts,tsx}",
        "src/adapters/ui/components/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/types.ts",
        "**/index.ts",
      ],
    },
  },
});
