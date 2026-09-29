import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const coreUiSrc = path.resolve(__dirname, "../core-ui/src");

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],

    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.test.mjs"],
    exclude: ["node_modules", "dist", "src/styled-system", "**/*.stories.tsx"],

    pool: "threads",
    testTimeout: 10000,
    hookTimeout: 10000,

    // No retries: a flaky test must fail the merge and release gate (PLAN P0 row 2)
    retry: 0,

    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  resolve: {
    alias: [
      // Panda codegen output, mirrored from tsconfig `paths`
      {
        find: /^styled-system\/(.*)$/,
        replacement: path.resolve(__dirname, "src/styled-system/$1"),
      },
      // Source tests run against core-ui source, not its build output
      {
        find: /^@scnx\/core-ui\/(components|hooks|providers)\/(.*)$/,
        replacement: `${coreUiSrc}/$1/$2`,
      },
    ],
  },
});
