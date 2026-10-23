# Scnehaux UI tokens — Figma plugin

Writes the `@scnx/system` tokens into the open Figma file (ADR-UIP-TKN-004; TDD tokens FG7–FG11):

- **Variables:** collection `Scnehaux / Color` with one mode per theme and mode (Light, Dark, Achromatic light, Achromatic dark) and `Scnehaux / Dimension` with one mode per theme. Names follow the canonical path (`color/neutral/surface/canvas/default`). Scopes follow the Tier-2 grammar, and each variable's WEB code syntax is its CSS custom property (`var(--ds-…)`).
- **Text styles:** one per typography composite (`heading/xlarge`, `body/default`, …). Figma has no system font stack, so code styles use Roboto Mono and say so in their descriptions.
- **Effect styles:** one per theme and shadow (`Default/shadow/low`, …), with shadow colors bound to the color variables so they follow the frame's mode.

The plugin finds every asset by name and updates it in place. It creates whatever is missing and never deletes anything. Variables it did not plan are listed and left untouched. When your Figma plan limits the number of modes, the plugin fills the modes it may create and lists the ones it skipped.

## Build and run

```sh
pnpm install
pnpm --filter @scnx/core-ui build && pnpm --filter @scnx/system build
pnpm --filter @scnx/system figma-plugin
```

In the Figma desktop app, choose **Plugins → Development → Import plugin from manifest…** and pick `packages/design-system/figma-plugin/manifest.json`. Then open a design file and run **Plugins → Development → Scnehaux UI tokens**. Run it again after every token change; the values come from the build, never from the file.

The plugin has no network access and needs no token. It reads and writes only the open file.
