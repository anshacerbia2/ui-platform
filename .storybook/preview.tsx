import type { Decorator, Preview } from "@storybook/react-vite";
import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
// The published artifacts, exactly as a consumer loads them (TDD styled-004).
import "../packages/design-system/dist/styles/components.css";
import "../packages/design-system/dist/tokens/css/default.css";
import "../packages/design-system/dist/tokens/css/achromatic.css";
import { MODES, THEMES, allModes } from "./modes";

const withTheme: Decorator = (Story, context) => (
  <ThemeProvider themeId={context.globals.theme} mode={context.globals.mode} storage={false}>
    <div data-workshop-canvas="" style={{ padding: "1.5rem", minHeight: "100%" }}>
      <Story />
    </div>
  </ThemeProvider>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme ID (data-scnx-theme)",
      toolbar: { title: "Theme", icon: "paintbrush", items: THEMES, dynamicTitle: true },
    },
    mode: {
      description: "Requested mode; system follows prefers-color-scheme",
      toolbar: { title: "Mode", icon: "mirror", items: [...MODES, "system"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: THEMES[0], mode: "light" },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    // Every story fails its test on an axe-core violation (ADR-UIP-WKS-001).
    a11y: { test: "error" },
    chromatic: { modes: allModes },
  },
  tags: ["autodocs"],
};

export default preview;
