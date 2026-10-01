// Canonical token grammar, transcribed from STD-UIP-TKN-001 v2.1.0 section 3
// (scnehaux-architecture af6462e). The standard is the single normative
// definition; change this file only to follow a ratified revision of it.

export const STANDARD = { id: "STD-UIP-TKN-001", version: "2.1.0", commit: "af6462e" };

const SURFACE_STATES = ["default", "hover", "pressed", "selected", "disabled"];

export const COLOR = {
  schemes: ["primary", "neutral", "info", "success", "warning", "danger"],
  roles: ["surface", "border", "text", "icon", "shadow"],
  states: ["default", "hover", "pressed", "selected", "focus", "disabled"],
  neutralOnlyEmphasis: ["canvas", "sunken", "raised", "floating"],
  // Role × Emphasis compatibility
  roleEmphasis: {
    surface: ["subtle", "default", "strong", "solid", "canvas", "sunken", "raised", "floating"],
    border: ["subtle", "default", "strong"],
    text: ["subtle", "default", "strong", "contrast"],
    icon: ["subtle", "default", "strong", "contrast"],
    shadow: ["subtle", "default", "strong", "contrast"],
  },
  // State compatibility invariant
  roleStates: {
    surface: SURFACE_STATES,
    border: ["default", "selected", "focus", "disabled"],
    text: ["default", "hover", "disabled"],
    icon: ["default", "hover", "disabled"],
    shadow: ["default", "hover", "pressed"],
  },
};

export const EFFECT_SHADOWS = ["low", "medium", "high", "overlay", "focus"];

// Dimension vocabulary. Lists are in the order the standard constrains:
// spacing relationships ascend compact -> comfortable, z-index strictly ascends.
export const DIMENSION = {
  spacing: [
    "inset-compact", "inset-default", "inset-comfortable",
    "stack-compact", "stack-default", "stack-comfortable",
    "inline-compact", "inline-default", "inline-comfortable",
    "section", "page",
  ],
  radius: ["element", "control", "container", "pill"],
  "border-width": ["default", "strong"],
  "z-index": ["base", "dropdown", "sticky", "overlay", "modal", "popover", "tooltip", "toast"],
};
const DIMENSION_TYPES = { spacing: "dimension", radius: "dimension", "border-width": "dimension", "z-index": "number" };

// Typography & Motion Semantic Families. Heading variants descend and weights
// ascend in the listed order.
export const TYPOGRAPHY = {
  composites: {
    body: ["large", "default", "small"],
    label: ["default", "small"],
    heading: ["xxlarge", "xlarge", "large", "medium", "small", "xsmall"],
    code: ["default", "small"],
    data: ["compact"],
    article: ["readable"],
    metric: ["display"],
  },
  members: {
    "font-family": "fontFamily",
    "font-size": "dimension",
    "font-weight": "fontWeight",
    "line-height": "number",
    "letter-spacing": "dimension",
  },
  weight: ["regular", "medium", "semibold", "bold"],
};

export const MOTION = { actions: ["enter", "exit", "attention", "disclosure", "feedback"], properties: ["duration", "easing"] };

/** Split `rest` as `<head>-<tail>` for the first head in `heads`, or null. */
function splitHead(rest, heads) {
  const head = heads.find((candidate) => rest.startsWith(`${candidate}-`));
  return head ? [head, rest.slice(head.length + 1)] : null;
}

/**
 * Parse an emitted custom property name against the canonical grammar.
 * @param {string} cssName e.g. "--ds-color-primary-surface-solid-default"
 * @param {Record<string, object>} aliases Tier-3 alias review records keyed by CSS name
 * @returns {{ valid: boolean, tier?: 2 | 3, type?: string, path?: string, error?: string }}
 */
export function parseTokenName(cssName, aliases = {}) {
  if (!cssName.startsWith("--ds-")) return { valid: false, error: "does not start with --ds-" };
  const rest = cssName.slice("--ds-".length);
  const parts = rest.split("-");

  if (aliases[cssName]) {
    return { valid: true, tier: 3, type: aliases[cssName].type, path: aliases[cssName].path };
  }

  if (parts[0] === "color") {
    if (parts.length !== 5) return { valid: false, error: "color names are color.{scheme}.{role}.{emphasis}.{state}" };
    const [, scheme, role, emphasis, state] = parts;
    if (!COLOR.schemes.includes(scheme)) return { valid: false, error: `unknown scheme "${scheme}"` };
    if (!COLOR.roles.includes(role)) return { valid: false, error: `unknown role "${role}"` };
    if (!COLOR.roleEmphasis[role].includes(emphasis)) {
      return { valid: false, error: `emphasis "${emphasis}" is not allowed for role "${role}"` };
    }
    if (COLOR.neutralOnlyEmphasis.includes(emphasis) && scheme !== "neutral") {
      return { valid: false, error: `emphasis "${emphasis}" is neutral-only` };
    }
    if (!COLOR.states.includes(state)) return { valid: false, error: `unknown state "${state}"` };
    if (!COLOR.roleStates[role].includes(state)) {
      return { valid: false, error: `state "${state}" is not allowed for role "${role}"` };
    }
    return { valid: true, tier: 2, type: "color", path: parts.join(".") };
  }

  if (parts[0] === "effect") {
    if (parts.length === 3 && parts[1] === "shadow" && EFFECT_SHADOWS.includes(parts[2])) {
      return { valid: true, tier: 2, type: "shadow", path: parts.join(".") };
    }
    return { valid: false, error: `effect names are effect.shadow.{${EFFECT_SHADOWS.join("|")}}` };
  }

  if (parts[0] === "motion") {
    const [, action, property] = parts;
    if (parts.length === 3 && MOTION.actions.includes(action) && MOTION.properties.includes(property)) {
      return { valid: true, tier: 2, type: property === "duration" ? "duration" : "cubicBezier", path: parts.join(".") };
    }
    return { valid: false, error: `motion names are motion.{${MOTION.actions.join("|")}}.{duration|easing}` };
  }

  if (parts[0] === "dimension") {
    const split = splitHead(rest.slice("dimension-".length), Object.keys(DIMENSION));
    if (split && DIMENSION[split[0]].includes(split[1])) {
      return { valid: true, tier: 2, type: DIMENSION_TYPES[split[0]], path: `dimension.${split[0]}.${split[1]}` };
    }
    return { valid: false, error: "dimension names are dimension.{property}.{intent} from the closed vocabulary" };
  }

  if (parts[0] === "typography") {
    const body = rest.slice("typography-".length);
    if (parts.length === 3 && parts[1] === "weight" && TYPOGRAPHY.weight.includes(parts[2])) {
      return { valid: true, tier: 2, type: "fontWeight", path: `typography.weight.${parts[2]}` };
    }
    const context = splitHead(body, Object.keys(TYPOGRAPHY.composites));
    const variant = context && splitHead(context[1], TYPOGRAPHY.composites[context[0]]);
    if (variant && TYPOGRAPHY.members[variant[1]]) {
      return {
        valid: true,
        tier: 2,
        type: TYPOGRAPHY.members[variant[1]],
        path: `typography.${context[0]}.${variant[0]}.${variant[1]}`,
      };
    }
    return { valid: false, error: "typography names are typography.{context}.{variant}.{member} or typography.weight.{weight}" };
  }

  return { valid: false, error: "not a canonical Tier-2 name and no Tier-3 alias review record" };
}

/** Token type from the canonical grammar; null for a non-canonical name. */
export function tokenType(cssName, aliases = {}) {
  const parsed = parseTokenName(cssName, aliases);
  return parsed.valid ? parsed.type : null;
}

// Representative consuming property for value validation: the property a
// canonical path names, otherwise the property for its type.
const PROPERTY_BY_PATH = [
  [/^dimension\.spacing\./, "margin"],
  [/^dimension\.radius\./, "border-radius"],
  [/^dimension\.border-width\./, "border-width"],
  [/^dimension\.z-index\./, "z-index"],
  [/^typography\.weight\./, "font-weight"],
  [/^typography\.[^.]+\.[^.]+\.(font-family|font-size|font-weight|line-height|letter-spacing)$/, null],
];
const PROPERTY_BY_TYPE = {
  color: "color",
  shadow: "box-shadow",
  duration: "transition-duration",
  cubicBezier: "transition-timing-function",
  fontFamily: "font-family",
  fontWeight: "font-weight",
  number: "opacity",
  dimension: "width",
  strokeStyle: "border-style",
};

export function consumingProperty(cssName, type, aliases = {}) {
  const parsed = parseTokenName(cssName, aliases);
  if (parsed.valid) {
    for (const [pattern, property] of PROPERTY_BY_PATH) {
      const match = pattern.exec(parsed.path);
      if (match) return property ?? match[1];
    }
  }
  return PROPERTY_BY_TYPE[type] ?? null;
}
