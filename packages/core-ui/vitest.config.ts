import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // Global test settings
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],

    // Test file patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "**/node_modules/**",
      "**/*.stories.tsx",
    ],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.stories.tsx",
        "**/index.ts",
        "**/*.d.ts",
        "**/types.ts",
        "**/test/**",
      ],
      // Enterprise-grade coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      // Report uncovered lines
      clean: true,
    },

    // Performance optimizations
    pool: "threads",

    // Test timeout (prevent hanging tests)
    testTimeout: 10000,
    hookTimeout: 10000,

    // No retries: a flaky test must fail the merge and release gate (PLAN P0 row 2)
    retry: 0,

    // Better error output
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  resolve: {
    alias: {
      "@test": path.resolve(__dirname, "test"),
    },
  },
});
