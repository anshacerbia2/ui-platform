import { defineConfig, defineRecipe } from "@pandacss/dev";

const containerRecipe = defineRecipe({
  className: "container",
  base: {
    width: "100%",
    mx: "auto",
    px: "var(--ds-spacing-md)",
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
    gap: {
      "0": { gap: "0" },
      "1": { gap: "var(--ds-spacing-2xs)" },
      "2": { gap: "var(--ds-spacing-xs)" },
      "3": { gap: "var(--ds-spacing-sm)" },
      "4": { gap: "var(--ds-spacing-md)" },
      "5": { gap: "1.25rem" },
      "6": { gap: "var(--ds-spacing-lg)" },
      "8": { gap: "var(--ds-spacing-xl)" },
      "10": { gap: "2.5rem" },
      "12": { gap: "var(--ds-spacing-2xl)" },
      "16": { gap: "var(--ds-spacing-3xl)" },
    },
  },
  defaultVariants: {
    direction: "row",
    align: "start",
    justify: "start",
    wrap: "nowrap",
    gap: "0",
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
    gap: {
      "0": { gap: "0" },
      "1": { gap: "var(--ds-spacing-2xs)" },
      "2": { gap: "var(--ds-spacing-xs)" },
      "3": { gap: "var(--ds-spacing-sm)" },
      "4": { gap: "var(--ds-spacing-md)" },
      "5": { gap: "1.25rem" },
      "6": { gap: "var(--ds-spacing-lg)" },
      "8": { gap: "var(--ds-spacing-xl)" },
      "10": { gap: "2.5rem" },
      "12": { gap: "var(--ds-spacing-2xl)" },
      "16": { gap: "var(--ds-spacing-3xl)" },
    },
  },
  defaultVariants: {
    columns: "1",
    gap: "0",
  },
});

const headingRecipe = defineRecipe({
  className: "heading",
  base: {
    fontFamily: "var(--ds-font-family-sans)",
    fontWeight: "var(--ds-font-weight-bold)",
    color: "var(--ds-color-neutral-text-default-default)",
    lineHeight: "var(--ds-line-height-tight)",
  },
  variants: {
    size: {
      // Geist Numeric Scale
      // Semantic T-shirt aliases (Single Axis API)
      "7xl": { fontSize: "var(--ds-font-size-4xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      "6xl": { fontSize: "var(--ds-font-size-4xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      "5xl": { fontSize: "var(--ds-font-size-4xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      "4xl": { fontSize: "var(--ds-font-size-4xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      "3xl": { fontSize: "var(--ds-font-size-3xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      "2xl": { fontSize: "var(--ds-font-size-2xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      xl: { fontSize: "var(--ds-font-size-xl)", letterSpacing: "var(--ds-letter-spacing-tight)" },
      lg: { fontSize: "var(--ds-font-size-lg)", letterSpacing: "var(--ds-letter-spacing-normal)" },
      base: { fontSize: "var(--ds-font-size-md)", letterSpacing: "var(--ds-letter-spacing-normal)" },
      sm: { fontSize: "var(--ds-font-size-sm)", letterSpacing: "var(--ds-letter-spacing-normal)" },
    },
    weight: {
      bold: { fontWeight: "var(--ds-font-weight-bold)" },
      semibold: { fontWeight: "var(--ds-font-weight-semibold)" },
      medium: { fontWeight: "var(--ds-font-weight-medium)" },
      regular: { fontWeight: "var(--ds-font-weight-regular)" },
      thin: { fontWeight: "var(--ds-font-weight-thin)" },
    }
  },
  defaultVariants: {
    size: "xl",
    weight: "bold",
  },
});

const codeRecipe = defineRecipe({
  className: "code",
  base: {
    fontFamily: "var(--ds-font-family-mono)",
    fontSize: "0.9em",
    fontWeight: "var(--ds-font-weight-medium)",
    backgroundColor: "var(--ds-color-neutral-surface-subtle-default)",
    borderWidth: "1px",
    borderColor: "var(--ds-color-neutral-border-subtle-default)",
    borderRadius: "var(--ds-radius-md)",
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
    fontFamily: "var(--ds-font-family-sans)",
    color: "var(--ds-color-neutral-text-default-default)",
    lineHeight: "var(--ds-line-height-normal)",
  },
  variants: {
    variant: {
      "body-lg": { fontSize: "var(--ds-font-size-lg)" },
      "body-base": { fontSize: "var(--ds-font-size-md)" },
      "body-sm": { fontSize: "var(--ds-font-size-sm)" },
      "body-xs": { fontSize: "var(--ds-font-size-xs)" },
      "label-sm": { fontSize: "var(--ds-font-size-xs)", fontWeight: "var(--ds-font-weight-medium)", textTransform: "uppercase", letterSpacing: "var(--ds-letter-spacing-wide)" },
    },
    weight: {
      bold: { fontWeight: "var(--ds-font-weight-bold)" },
      semibold: { fontWeight: "var(--ds-font-weight-semibold)" },
      medium: { fontWeight: "var(--ds-font-weight-medium)" },
      regular: { fontWeight: "var(--ds-font-weight-regular)" },
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
    variant: "body-base",
    weight: "regular",
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
      "1": { gap: "var(--ds-spacing-2xs)" },
      "2": { gap: "var(--ds-spacing-xs)" },
      "3": { gap: "var(--ds-spacing-sm)" },
      "4": { gap: "var(--ds-spacing-md)" },
    },
  },
  defaultVariants: {
    variant: "unordered",
    spacing: "1",
  },
});

const listItemRecipe = defineRecipe({
  className: "list-item",
  base: {
    display: "list-item",
    lineHeight: "var(--ds-line-height-normal)",
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
        "2xs": { value: "var(--ds-spacing-2xs)" },
        "xs": { value: "var(--ds-spacing-xs)" },
        "sm": { value: "var(--ds-spacing-sm)" },
        "md": { value: "var(--ds-spacing-md)" },
        "lg": { value: "var(--ds-spacing-lg)" },
        "xl": { value: "var(--ds-spacing-xl)" },
        "2xl": { value: "var(--ds-spacing-2xl)" },
        "3xl": { value: "var(--ds-spacing-3xl)" },
      },
      radii: {
        "sm": { value: "var(--ds-radius-sm)" },
        "md": { value: "var(--ds-radius-md)" },
        "lg": { value: "var(--ds-radius-lg)" },
        "full": { value: "var(--ds-radius-full)" },
      },
      fontSizes: {
        "xs": { value: "var(--ds-font-size-xs)" },
        "sm": { value: "var(--ds-font-size-sm)" },
        "md": { value: "var(--ds-font-size-md)" },
        "lg": { value: "var(--ds-font-size-lg)" },
        "xl": { value: "var(--ds-font-size-xl)" },
        "2xl": { value: "var(--ds-font-size-2xl)" },
        "3xl": { value: "var(--ds-font-size-3xl)" },
        "4xl": { value: "var(--ds-font-size-4xl)" },
      },
      fontWeights: {
        "thin": { value: "var(--ds-font-weight-thin)" },
        "regular": { value: "var(--ds-font-weight-regular)" },
        "medium": { value: "var(--ds-font-weight-medium)" },
        "semibold": { value: "var(--ds-font-weight-semibold)" },
        "bold": { value: "var(--ds-font-weight-bold)" },
      },
      fonts: {
        "sans": { value: "var(--ds-font-family-sans)" },
        "mono": { value: "var(--ds-font-family-mono)" },
      },
      lineHeights: {
        "tight": { value: "var(--ds-line-height-tight)" },
        "normal": { value: "var(--ds-line-height-normal)" },
        "relaxed": { value: "var(--ds-line-height-relaxed)" },
      },
      letterSpacings: {
        "tight": { value: "var(--ds-letter-spacing-tight)" },
        "normal": { value: "var(--ds-letter-spacing-normal)" },
        "wide": { value: "var(--ds-letter-spacing-wide)" },
      }
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
