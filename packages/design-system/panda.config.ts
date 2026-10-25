import { defineConfig, defineRecipe } from "@pandacss/dev";

// Tier-3 component hooks (ADR-UIP-VIS-001 item 8; STD-UIP-TKN-001 2.7.0, "Hook
// mechanics"; TDD styled HK6): `var(--scnx-{component}-{name}, {fallback})`,
// referenced with its fallback and never declared, as styles/abstracts/_hook.scss
// writes them for the Sass components.
const hook = (component: string, name: string, fallback: string) => `var(--scnx-${component}-${name}, ${fallback})`;

const containerRecipe = defineRecipe({
  className: "scnx-container",
  base: {
    width: "100%",
    mx: "auto",
    px: hook("container", "padding-inline", "var(--ds-dimension-spacing-page)"),
  },
  variants: {
    size: {
      prose: { maxW: hook("container", "max-width", "65ch") },
      base: { maxW: hook("container", "max-width", "1024px") },
      wide: { maxW: hook("container", "max-width", "1440px") },
      fluid: { maxW: "100%" },
    },
  },
  defaultVariants: {
    size: "base",
  },
});

const flexRecipe = defineRecipe({
  className: "scnx-flex",
  base: {
    display: "flex",
  },
  variants: {
    direction: {
      row: { flexDirection: "row" },
      col: { flexDirection: "column" },
      "row-reverse": { flexDirection: "row-reverse" },
      "col-reverse": { flexDirection: "column-reverse" },
    },
    align: {
      start: { alignItems: "flex-start" },
      center: { alignItems: "center" },
      end: { alignItems: "flex-end" },
      stretch: { alignItems: "stretch" },
      baseline: { alignItems: "baseline" },
    },
    justify: {
      start: { justifyContent: "flex-start" },
      center: { justifyContent: "center" },
      end: { justifyContent: "flex-end" },
      between: { justifyContent: "space-between" },
      around: { justifyContent: "space-around" },
      evenly: { justifyContent: "space-evenly" },
    },
    wrap: {
      nowrap: { flexWrap: "nowrap" },
      wrap: { flexWrap: "wrap" },
      "wrap-reverse": { flexWrap: "wrap-reverse" },
    },
    // Density names (STD-UIP-TKN-001 spacing): rows use the block-axis
    // stack scale and columns the inline-axis scale.
    gap: {
      none: { gap: "0" },
      compact: { rowGap: hook("flex", "row-gap", "var(--ds-dimension-spacing-stack-compact)"), columnGap: hook("flex", "column-gap", "var(--ds-dimension-spacing-inline-compact)") },
      default: { rowGap: hook("flex", "row-gap", "var(--ds-dimension-spacing-stack-default)"), columnGap: hook("flex", "column-gap", "var(--ds-dimension-spacing-inline-default)") },
      comfortable: { rowGap: hook("flex", "row-gap", "var(--ds-dimension-spacing-stack-comfortable)"), columnGap: hook("flex", "column-gap", "var(--ds-dimension-spacing-inline-comfortable)") },
      section: { gap: hook("flex", "gap", "var(--ds-dimension-spacing-section)") },
    },
  },
  defaultVariants: {
    direction: "row",
    align: "start",
    justify: "start",
    wrap: "nowrap",
    gap: "none",
  },
});

const gridRecipe = defineRecipe({
  className: "scnx-grid",
  base: {
    display: "grid",
  },
  variants: {
    columns: {
      "1": { gridTemplateColumns: "repeat(1, minmax(0, 1fr))" },
      "2": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
      "3": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
      "4": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
      "5": { gridTemplateColumns: "repeat(5, minmax(0, 1fr))" },
      "6": { gridTemplateColumns: "repeat(6, minmax(0, 1fr))" },
      "7": { gridTemplateColumns: "repeat(7, minmax(0, 1fr))" },
      "8": { gridTemplateColumns: "repeat(8, minmax(0, 1fr))" },
      "9": { gridTemplateColumns: "repeat(9, minmax(0, 1fr))" },
      "10": { gridTemplateColumns: "repeat(10, minmax(0, 1fr))" },
      "11": { gridTemplateColumns: "repeat(11, minmax(0, 1fr))" },
      "12": { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" },
    },
    // Density names (STD-UIP-TKN-001 spacing): rows use the block-axis
    // stack scale and columns the inline-axis scale.
    gap: {
      none: { gap: "0" },
      compact: { rowGap: hook("grid", "row-gap", "var(--ds-dimension-spacing-stack-compact)"), columnGap: hook("grid", "column-gap", "var(--ds-dimension-spacing-inline-compact)") },
      default: { rowGap: hook("grid", "row-gap", "var(--ds-dimension-spacing-stack-default)"), columnGap: hook("grid", "column-gap", "var(--ds-dimension-spacing-inline-default)") },
      comfortable: { rowGap: hook("grid", "row-gap", "var(--ds-dimension-spacing-stack-comfortable)"), columnGap: hook("grid", "column-gap", "var(--ds-dimension-spacing-inline-comfortable)") },
      section: { gap: hook("grid", "gap", "var(--ds-dimension-spacing-section)") },
    },
  },
  defaultVariants: {
    columns: "1",
    gap: "none",
  },
});

const headingRecipe = defineRecipe({
  className: "scnx-heading",
  base: {
    color: hook("heading", "color", "var(--ds-color-neutral-text-default-default)"),
  },
  variants: {
    // typography.heading.*: the size is independent of the heading level.
    size: {
      xxlarge: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-xxlarge-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-xxlarge-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-xxlarge-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-xxlarge-letter-spacing)") },
      xlarge: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-xlarge-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-xlarge-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-xlarge-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-xlarge-letter-spacing)") },
      large: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-large-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-large-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-large-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-large-letter-spacing)") },
      medium: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-medium-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-medium-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-medium-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-medium-letter-spacing)") },
      small: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-small-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-small-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-small-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-small-letter-spacing)") },
      xsmall: { fontFamily: hook("heading", "font-family", "var(--ds-typography-heading-xsmall-font-family)"), fontSize: hook("heading", "font-size", "var(--ds-typography-heading-xsmall-font-size)"), lineHeight: hook("heading", "line-height", "var(--ds-typography-heading-xsmall-line-height)"), letterSpacing: hook("heading", "letter-spacing", "var(--ds-typography-heading-xsmall-letter-spacing)") },
    },
    weight: {
      bold: { fontWeight: hook("heading", "font-weight", "var(--ds-typography-weight-bold)") },
      semibold: { fontWeight: hook("heading", "font-weight", "var(--ds-typography-weight-semibold)") },
      medium: { fontWeight: hook("heading", "font-weight", "var(--ds-typography-weight-medium)") },
      regular: { fontWeight: hook("heading", "font-weight", "var(--ds-typography-weight-regular)") },
    },
  },
  defaultVariants: {
    size: "medium",
    weight: "bold",
  },
});

const codeRecipe = defineRecipe({
  className: "scnx-code",
  base: {
    fontFamily: hook("code", "font-family", "var(--ds-typography-code-default-font-family)"),
    fontSize: hook("code", "font-size", "0.9em"),
    fontWeight: hook("code", "font-weight", "var(--ds-typography-weight-medium)"),
    backgroundColor: hook("code", "background", "var(--ds-color-neutral-surface-subtle-default)"),
    // A border needs a style: the reset sets none, so a width and color alone drew nothing.
    borderStyle: "solid",
    borderWidth: hook("code", "border-width", "var(--ds-dimension-border-width-default)"),
    borderColor: hook("code", "border-color", "var(--ds-color-neutral-border-subtle-default)"),
    // Inline code is a mark (TDD styled RL2): 4px, so it stays crisp in running text.
    borderRadius: hook("code", "radius", "var(--ds-dimension-radius-mark)"),
    px: hook("code", "padding-inline", "0.4em"),
    py: hook("code", "padding-block", "0.1em"),
    whiteSpace: "nowrap",
    color: "inherit", 
  },
  variants: {
    intent: {
      primary: {
        color: hook("code", "color", "var(--ds-color-primary-text-default-default)"),
        backgroundColor: hook("code", "background", "var(--ds-color-primary-surface-subtle-default)"),
        borderColor: hook("code", "border-color", "var(--ds-color-primary-border-default-default)"),
      },
      info: {
        color: hook("code", "color", "var(--ds-color-info-text-default-default)"),
        backgroundColor: hook("code", "background", "var(--ds-color-info-surface-subtle-default)"),
        borderColor: hook("code", "border-color", "var(--ds-color-info-border-default-default)"),
      },
      success: {
        color: hook("code", "color", "var(--ds-color-success-text-default-default)"),
        backgroundColor: hook("code", "background", "var(--ds-color-success-surface-subtle-default)"),
        borderColor: hook("code", "border-color", "var(--ds-color-success-border-default-default)"),
      },
      warning: {
        color: hook("code", "color", "var(--ds-color-warning-text-default-default)"),
        backgroundColor: hook("code", "background", "var(--ds-color-warning-surface-subtle-default)"),
        borderColor: hook("code", "border-color", "var(--ds-color-warning-border-default-default)"),
      },
      danger: {
        color: hook("code", "color", "var(--ds-color-danger-text-default-default)"),
        backgroundColor: hook("code", "background", "var(--ds-color-danger-surface-subtle-default)"),
        borderColor: hook("code", "border-color", "var(--ds-color-danger-border-default-default)"),
      },
    }
  }
});

const textRecipe = defineRecipe({
  className: "scnx-text",
  base: {
    color: hook("text", "color", "var(--ds-color-neutral-text-default-default)"),
  },
  variants: {
    // One typography composite per variant; `weight` varies only the weight.
    variant: {
      "body-large": { fontFamily: hook("text", "font-family", "var(--ds-typography-body-large-font-family)"), fontSize: hook("text", "font-size", "var(--ds-typography-body-large-font-size)"), fontWeight: hook("text", "font-weight", "var(--ds-typography-body-large-font-weight)"), lineHeight: hook("text", "line-height", "var(--ds-typography-body-large-line-height)"), letterSpacing: hook("text", "letter-spacing", "var(--ds-typography-body-large-letter-spacing)") },
      "body-default": { fontFamily: hook("text", "font-family", "var(--ds-typography-body-default-font-family)"), fontSize: hook("text", "font-size", "var(--ds-typography-body-default-font-size)"), fontWeight: hook("text", "font-weight", "var(--ds-typography-body-default-font-weight)"), lineHeight: hook("text", "line-height", "var(--ds-typography-body-default-line-height)"), letterSpacing: hook("text", "letter-spacing", "var(--ds-typography-body-default-letter-spacing)") },
      "body-small": { fontFamily: hook("text", "font-family", "var(--ds-typography-body-small-font-family)"), fontSize: hook("text", "font-size", "var(--ds-typography-body-small-font-size)"), fontWeight: hook("text", "font-weight", "var(--ds-typography-body-small-font-weight)"), lineHeight: hook("text", "line-height", "var(--ds-typography-body-small-line-height)"), letterSpacing: hook("text", "letter-spacing", "var(--ds-typography-body-small-letter-spacing)") },
      "label-default": { fontFamily: hook("text", "font-family", "var(--ds-typography-label-default-font-family)"), fontSize: hook("text", "font-size", "var(--ds-typography-label-default-font-size)"), fontWeight: hook("text", "font-weight", "var(--ds-typography-label-default-font-weight)"), lineHeight: hook("text", "line-height", "var(--ds-typography-label-default-line-height)"), letterSpacing: hook("text", "letter-spacing", "var(--ds-typography-label-default-letter-spacing)") },
      "label-small": { fontFamily: hook("text", "font-family", "var(--ds-typography-label-small-font-family)"), fontSize: hook("text", "font-size", "var(--ds-typography-label-small-font-size)"), fontWeight: hook("text", "font-weight", "var(--ds-typography-label-small-font-weight)"), lineHeight: hook("text", "line-height", "var(--ds-typography-label-small-line-height)"), letterSpacing: hook("text", "letter-spacing", "var(--ds-typography-label-small-letter-spacing)"), textTransform: "uppercase" },
    },
    weight: {
      bold: { fontWeight: hook("text", "font-weight", "var(--ds-typography-weight-bold)") },
      semibold: { fontWeight: hook("text", "font-weight", "var(--ds-typography-weight-semibold)") },
      medium: { fontWeight: hook("text", "font-weight", "var(--ds-typography-weight-medium)") },
      regular: { fontWeight: hook("text", "font-weight", "var(--ds-typography-weight-regular)") },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },
    dimmed: {
      // The subtle text token carries the dimming; opacity would also fade the text below its measured contrast.
      true: { color: hook("text", "color-dimmed", "var(--ds-color-neutral-text-subtle-default)") },
    },
  },
  defaultVariants: {
    variant: "body-default",
    align: "left",
  },
});

const listRecipe = defineRecipe({
  className: "scnx-list",
  base: {
    display: "flex",
    flexDirection: "column",
  },
  variants: {
    variant: {
      unordered: { listStyleType: "disc", pl: hook("list", "marker-gutter", "1.25rem") },
      ordered: { listStyleType: "decimal", pl: hook("list", "marker-gutter", "1.25rem") },
      unstyled: { listStyleType: "none", pl: "0" },
    },
    spacing: {
      compact: { gap: hook("list", "gap", "var(--ds-dimension-spacing-stack-compact)") },
      default: { gap: hook("list", "gap", "var(--ds-dimension-spacing-stack-default)") },
      comfortable: { gap: hook("list", "gap", "var(--ds-dimension-spacing-stack-comfortable)") },
    },
  },
  defaultVariants: {
    variant: "unordered",
    spacing: "compact",
  },
});

const listItemRecipe = defineRecipe({
  className: "scnx-list-item",
  base: {
    display: "list-item",
    color: "inherit",
  },
});

export default defineConfig({
  preflight: false,
  presets: [], // Disable Panda's default tokens and theme
  jsxFramework: "react",
  // Only the styled components are scan input: @scnx/core-ui stays
  // style-engine agnostic (ADR-GLB-FE-013 5.3.6), and Panda's generated
  // src/styled-system is output, not source.
  include: ["src/components/**/*.{ts,tsx}"],
  exclude: [],
  theme: {
    tokens: {
      colors: {
        neutral: {
          text: {
            default: { value: "var(--ds-color-neutral-text-default-default)" },
            subtle: { value: "var(--ds-color-neutral-text-subtle-default)" },
          },
          surface: {
            default: { value: "var(--ds-color-neutral-surface-default-default)" },
            subtle: { value: "var(--ds-color-neutral-surface-subtle-default)" },
          },
          border: {
            default: { value: "var(--ds-color-neutral-border-default-default)" },
            subtle: { value: "var(--ds-color-neutral-border-subtle-default)" },
          }
        },
        primary: {
          text: { default: { value: "var(--ds-color-primary-text-default-default)" } },
          surface: {
            default: { value: "var(--ds-color-primary-surface-default-default)" },
            subtle: { value: "var(--ds-color-primary-surface-subtle-default)" },
          },
          border: { default: { value: "var(--ds-color-primary-border-default-default)" } }
        },
        info: {
          text: { default: { value: "var(--ds-color-info-text-default-default)" } },
          surface: { subtle: { value: "var(--ds-color-info-surface-subtle-default)" } },
          border: { default: { value: "var(--ds-color-info-border-default-default)" } },
        },
        success: {
          text: { default: { value: "var(--ds-color-success-text-default-default)" } },
          surface: { subtle: { value: "var(--ds-color-success-surface-subtle-default)" } },
          border: { default: { value: "var(--ds-color-success-border-default-default)" } },
        },
        warning: {
          text: { default: { value: "var(--ds-color-warning-text-default-default)" } },
          surface: { subtle: { value: "var(--ds-color-warning-surface-subtle-default)" } },
          border: { default: { value: "var(--ds-color-warning-border-default-default)" } },
        },
        danger: {
          text: { default: { value: "var(--ds-color-danger-text-default-default)" } },
          surface: { subtle: { value: "var(--ds-color-danger-surface-subtle-default)" } },
          border: { default: { value: "var(--ds-color-danger-border-default-default)" } },
        }
      },
      spacing: {
        "inset-compact": { value: "var(--ds-dimension-spacing-inset-compact)" },
        "inset-default": { value: "var(--ds-dimension-spacing-inset-default)" },
        "inset-comfortable": { value: "var(--ds-dimension-spacing-inset-comfortable)" },
        "stack-compact": { value: "var(--ds-dimension-spacing-stack-compact)" },
        "stack-default": { value: "var(--ds-dimension-spacing-stack-default)" },
        "stack-comfortable": { value: "var(--ds-dimension-spacing-stack-comfortable)" },
        "inline-compact": { value: "var(--ds-dimension-spacing-inline-compact)" },
        "inline-default": { value: "var(--ds-dimension-spacing-inline-default)" },
        "inline-comfortable": { value: "var(--ds-dimension-spacing-inline-comfortable)" },
        "section": { value: "var(--ds-dimension-spacing-section)" },
        "page": { value: "var(--ds-dimension-spacing-page)" },
      },
      radii: {
        element: { value: "var(--ds-dimension-radius-element)" },
        control: { value: "var(--ds-dimension-radius-control)" },
        container: { value: "var(--ds-dimension-radius-container)" },
        pill: { value: "var(--ds-dimension-radius-pill)" },
      },
      fontWeights: {
        regular: { value: "var(--ds-typography-weight-regular)" },
        medium: { value: "var(--ds-typography-weight-medium)" },
        semibold: { value: "var(--ds-typography-weight-semibold)" },
        bold: { value: "var(--ds-typography-weight-bold)" },
      },
      fonts: {
        body: { value: "var(--ds-typography-body-default-font-family)" },
        code: { value: "var(--ds-typography-code-default-font-family)" },
      },
      zIndex: {
        base: { value: "var(--ds-dimension-z-index-base)" },
        dropdown: { value: "var(--ds-dimension-z-index-dropdown)" },
        sticky: { value: "var(--ds-dimension-z-index-sticky)" },
        overlay: { value: "var(--ds-dimension-z-index-overlay)" },
        modal: { value: "var(--ds-dimension-z-index-modal)" },
        popover: { value: "var(--ds-dimension-z-index-popover)" },
        tooltip: { value: "var(--ds-dimension-z-index-tooltip)" },
        toast: { value: "var(--ds-dimension-z-index-toast)" },
      },
    },
    extend: {
      recipes: {
        containerRecipe,
        flexRecipe,
        gridRecipe,
        headingRecipe,
        codeRecipe,
        textRecipe,
        listRecipe,
        listItemRecipe
      }
    },
  },
  staticCss: {
    recipes: {
      containerRecipe: ["*"],
      flexRecipe: ["*"],
      gridRecipe: ["*"],
      headingRecipe: ["*"],
      codeRecipe: ["*"],
      textRecipe: ["*"],
      listRecipe: ["*"],
      listItemRecipe: ["*"]
    }
  },
  outdir: "src/styled-system",
  outExtension: "js",
  importMap: "styled-system",
});
