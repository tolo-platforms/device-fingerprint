import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/**/*.test.ts",
        "src/__tests__/**",
        "src/__mocks__/**",
        "*.config.*",
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/__mocks__/browser-apis.ts"],
  },
});
