// Canonical cascade layer order (STD-GLB-FE-005 section 3.4; TDD CSS delivery).
// Additional layers require a revision of the standard.
export const LAYERS = ["reset", "tokens", "base", "components", "recipes", "utilities", "overrides"];

/** The layer order statement every UI Platform stylesheet starts with. */
export const LAYER_STATEMENT = `@layer ${LAYERS.join(", ")};`;
