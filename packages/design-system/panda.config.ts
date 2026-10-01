import { defineConfig, defineRecipe } from "@pandacss/dev";

const containerRecipe = defineRecipe({
  className: "container",
  base: {
    width: "100%",
    mx: "auto",
    px: "var(--ds-dimension-spacing-page)",
  },
  variants: {
    size: {
      prose: { maxW: "65ch" },
      base: { maxW: "1024px" },
      wide: { maxW: "1440px" },
      fluid: { maxW: "100%" },
    },
  },
  defaultVariants: {
    size: "base",
  },
});

const flexRecipe = defineRecipe({
  className: "flex",
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
      compact: { rowGap: "var(--ds-dimension-spacing-stack-compact)", columnGap: "var(--ds-dimension-spacing-inline-compact)" },
      default: { rowGap: "var(--ds-dimension-spacing-stack-default)", columnGap: "var(--ds-dimension-spacing-inline-default)" },
      comfortable: { rowGap: "var(--ds-dimension-spacing-stack-comfortable)", columnGap: "var(--ds-dimension-spacing-inline-comfortable)" },
      section: { gap: "var(--ds-dimension-spacing-section)" },
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
  className: "grid",
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
      compact: { rowGap: "var(--ds-dimension-spacing-stack-compact)", columnGap: "var(--ds-dimension-spacing-inline-compact)" },
      default: { rowGap: "var(--ds-dimension-spacing-stack-default)", columnGap: "var(--ds-dimension-spacing-inline-default)" },
      comfortable: { rowGap: "var(--ds-dimension-spacing-stack-comfortable)", columnGap: "var(--ds-dimension-spacing-inline-comfortable)" },
      section: { gap: "var(--ds-dimension-spacing-section)" },
    },
  },
  defaultVariants: {
    columns: "1",
    gap: "none",
  },
});

const headingRecipe = defineRecipe({
  className: "heading",
  base: {
    color: "var(--ds-color-neutral-text-default-default)",
  },
  variants: {
    // typography.heading.*: the size is independent of the heading level.
    size: {
      xxlarge: { fontFamily: "var(--ds-typography-heading-xxlarge-font-family)", fontSize: "var(--ds-typography-heading-xxlarge-font-size)", lineHeight: "var(--ds-typography-heading-xxlarge-line-height)", letterSpacing: "var(--ds-typography-heading-xxlarge-letter-spacing)" },
      xlarge: { fontFamily: "var(--ds-typography-heading-xlarge-font-family)", fontSize: "var(--ds-typography-heading-xlarge-font-size)", lineHeight: "var(--ds-typography-heading-xlarge-line-height)", letterSpacing: "var(--ds-typography-heading-xlarge-letter-spacing)" },
      large: { fontFamily: "var(--ds-typography-heading-large-font-family)", fontSize: "var(--ds-typography-heading-large-font-size)", lineHeight: "var(--ds-typography-heading-large-line-height)", letterSpacing: "var(--ds-typography-heading-large-letter-spacing)" },
      medium: { fontFamily: "var(--ds-typography-heading-medium-font-family)", fontSize: "var(--ds-typography-heading-medium-font-size)", lineHeight: "var(--ds-typography-heading-medium-line-height)", letterSpacing: "var(--ds-typography-heading-medium-letter-spacing)" },
      small: { fontFamily: "var(--ds-typography-heading-small-font-family)", fontSize: "var(--ds-typography-heading-small-font-size)", lineHeight: "var(--ds-typography-heading-small-line-height)", letterSpacing: "var(--ds-typography-heading-small-letter-spacing)" },
      xsmall: { fontFamily: "var(--ds-typography-heading-xsmall-font-family)", fontSize: "var(--ds-typography-heading-xsmall-font-size)", lineHeight: "var(--ds-typography-heading-xsmall-line-height)", letterSpacing: "var(--ds-typography-heading-xsmall-letter-spacing)" },
    },
    weight: {
      bold: { fontWeight: "var(--ds-typography-weight-bold)" },
      semibold: { fontWeight: "var(--ds-typography-weight-semibold)" },
      medium: { fontWeight: "var(--ds-typography-weight-medium)" },
      regular: { fontWeight: "var(--ds-typography-weight-regular)" },
    },
  },
  defaultVariants: {
    size: "medium",
    weight: "bold",
  },
});

const codeRecipe = defineRecipe({
  className: "code",
  base: {
    fontFamily: "var(--ds-typography-code-default-font-family)",
    fontSize: "0.9em",
    fontWeight: "var(--ds-typography-weight-medium)",
    backgroundColor: "var(--ds-color-neutral-surface-subtle-default)",
    borderWidth: "1px",
    borderColor: "var(--ds-color-neutral-border-subtle-default)",
    borderRadius: "var(--ds-dimension-radius-element)",
    px: "0.4em",
    py: "0.1em",
    whiteSpace: "nowrap",
    color: "inherit", 
  },
  variants: {
    intent: {
      primary: {
        color: "var(--ds-color-primary-text-default-default)",
        backgroundColor: "var(--ds-color-primary-surface-subtle-default)",
        borderColor: "var(--ds-color-primary-border-default-default)",
      },
      info: {
        color: "var(--ds-color-info-text-default-default)",
        backgroundColor: "var(--ds-color-info-surface-subtle-default)",
        borderColor: "var(--ds-color-info-border-default-default)",
      },
      success: {
        color: "var(--ds-color-success-text-default-default)",
        backgroundColor: "var(--ds-color-success-surface-subtle-default)",
        borderColor: "var(--ds-color-success-border-default-default)",
      },
      warning: {
        color: "var(--ds-color-warning-text-default-default)",
        backgroundColor: "var(--ds-color-warning-surface-subtle-default)",
        borderColor: "var(--ds-color-warning-border-default-default)",
      },
      danger: {
        color: "var(--ds-color-danger-text-default-default)",
        backgroundColor: "var(--ds-color-danger-surface-subtle-default)",
        borderColor: "var(--ds-color-danger-border-default-default)",
      },
    }
  }
});

const textRecipe = defineRecipe({
  className: "text",
  base: {
    color: "var(--ds-color-neutral-text-default-default)",
  },
  variants: {
    // One typography composite per variant; `weight` varies only the weight.
    variant: {
      "body-large": { fontFamily: "var(--ds-typography-body-large-font-family)", fontSize: "var(--ds-typography-body-large-font-size)", fontWeight: "var(--ds-typography-body-large-font-weight)", lineHeight: "var(--ds-typography-body-large-line-height)", letterSpacing: "var(--ds-typography-body-large-letter-spacing)" },
      "body-default": { fontFamily: "var(--ds-typography-body-default-font-family)", fontSize: "var(--ds-typography-body-default-font-size)", fontWeight: "var(--ds-typography-body-default-font-weight)", lineHeight: "var(--ds-typography-body-default-line-height)", letterSpacing: "var(--ds-typography-body-default-letter-spacing)" },
      "body-small": { fontFamily: "var(--ds-typography-body-small-font-family)", fontSize: "var(--ds-typography-body-small-font-size)", fontWeight: "var(--ds-typography-body-small-font-weight)", lineHeight: "var(--ds-typography-body-small-line-height)", letterSpacing: "var(--ds-typography-body-small-letter-spacing)" },
      "label-default": { fontFamily: "var(--ds-typography-label-default-font-family)", fontSize: "var(--ds-typography-label-default-font-size)", fontWeight: "var(--ds-typography-label-default-font-weight)", lineHeight: "var(--ds-typography-label-default-line-height)", letterSpacing: "var(--ds-typography-label-default-letter-spacing)" },
      "label-small": { fontFamily: "var(--ds-typography-label-small-font-family)", fontSize: "var(--ds-typography-label-small-font-size)", fontWeight: "var(--ds-typography-label-small-font-weight)", lineHeight: "var(--ds-typography-label-small-line-height)", letterSpacing: "var(--ds-typography-label-small-letter-spacing)", textTransform: "uppercase" },
    },
    weight: {
      bold: { fontWeight: "var(--ds-typography-weight-bold)" },
      semibold: { fontWeight: "var(--ds-typography-weight-semibold)" },
      medium: { fontWeight: "var(--ds-typography-weight-medium)" },
      regular: { fontWeight: "var(--ds-typography-weight-regular)" },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },
    dimmed: {
      true: { opacity: 0.7, color: "var(--ds-color-neutral-text-subtle-default)" },
    },
  },
  defaultVariants: {
    variant: "body-default",
    align: "left",
  },
});

const listRecipe = defineRecipe({
  className: "list",
  base: {
    display: "flex",
    flexDirection: "column",
  },
  variants: {
    variant: {
      unordered: { listStyleType: "disc", pl: "1.25rem" },
      ordered: { listStyleType: "decimal", pl: "1.25rem" },
      unstyled: { listStyleType: "none", pl: "0" },
    },
    spacing: {
      compact: { gap: "var(--ds-dimension-spacing-stack-compact)" },
      default: { gap: "var(--ds-dimension-spacing-stack-default)" },
      comfortable: { gap: "var(--ds-dimension-spacing-stack-comfortable)" },
    },
  },
  defaultVariants: {
    variant: "unordered",
    spacing: "compact",
  },
});

const listItemRecipe = defineRecipe({
  className: "list-item",
  base: {
    display: "list-item",
    color: "inherit",
  },
});

export default defineConfig({
  preflight: false,
  presets: [], // Disable Panda's default tokens and theme
  jsxFramework: "react",
  include: [
    "src/**/*.{js,jsx,ts,tsx}",
    "../core-ui/src/**/*.{js,jsx,ts,tsx}"
  ],
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
