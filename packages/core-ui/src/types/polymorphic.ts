import type { ComponentPropsWithRef, JSX } from "react";

// Closed `as` unions (TDD primitives PRM-006): layout and typography
// primitives render one tag from a component-specific list, never any
// ElementType. Interactive parts compose through `asChild` instead.

/** Tags a layout primitive (Box, Flex, Grid, Container) may render. */
export type LayoutTag = "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav" | "span";

/** Tags a heading may render; the visual size is independent of the level. */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

/** Tags a text primitive may render. */
export type TextTag = "p" | "span" | "div" | "label" | "strong" | "em" | "small" | "figcaption" | "blockquote" | "cite" | "time";

/** Props of a component that renders `T`, one tag of a closed union, plus its own props `P`. */
export type ClosedAsProps<T extends keyof JSX.IntrinsicElements, P = {}> = P & { as?: T } & Omit<ComponentPropsWithRef<T>, keyof P | "as">;
