import type { KbdProps } from "./types";
import { cx } from "styled-system/css";

/**
 * One keyboard key, as a keycap: a native `kbd` (WHATWG HTML, "the kbd
 * element"), so assistive technology reads it as keyboard input. Give one key
 * per Kbd and write a chord as several, side by side; use the platform's
 * glyphs (⌘ ⌥ ⇧) on macOS and words elsewhere.
 *
 * @example
 * ```tsx
 * import { Kbd } from "@scnx/system/components/kbd";
 *
 * <Kbd>⌘</Kbd> <Kbd>K</Kbd>
 * ```
 */
export const Kbd = ({ className = "", ...rest }: KbdProps) => <kbd {...rest} className={cx("scnx-kbd", className)} />;

Kbd.displayName = "Kbd";
