import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

// Component workshop (ADR-UIP-WKS-001; TDD styled-004, Testing Strategy).
// Stories sit beside their component. The preview loads the built CSS
// artifacts, so run `pnpm build` first.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../packages/design-system/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: { disableTelemetry: true },
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: (vite) =>
    mergeConfig(vite, {
      resolve: {
        alias: [
          // Panda codegen output, as in packages/design-system tsconfig `paths`.
          { find: /^styled-system\/(.*)$/, replacement: path.join(root, "packages/design-system/src/styled-system/$1") },
          // One module instance of core-ui for components and the preview's ThemeProvider.
          { find: /^@scnx\/core-ui\/(components|hooks|providers)\/(.*)$/, replacement: path.join(root, "packages/core-ui/src/$1/$2") },
        ],
      },
    }),
};

export default config;
