import { ButtonBase, type ButtonBaseProps } from "@scnx/core-ui/components/button-base";

import type { IconButtonProps } from "./types";
import { cx } from "styled-system/css";

/**
 * A square (or, with `shape="circular"`, round) button whose content is one icon. Wraps
 * `@scnx/core-ui/components/button-base` (button, link, or `asChild` mode),
 * and its type requires an accessible name, `aria-label` or
 * `aria-labelledby`. Pass a 16 px icon marked `aria-hidden`.
 *
 * @example
 * ```tsx
 * import { IconButton } from "@scnx/system/components/icon-button";
 *
 * <IconButton aria-label="Close" variant="ghost" onClick={close}>
 *   <XIcon aria-hidden size={16} />
 * </IconButton>
 * ```
 */
export const IconButton = ({ variant = "secondary", size = "medium", shape = "square", className = "", ...rest }: IconButtonProps) => (
  // The props are one ButtonBase mode, which ButtonBase discriminates at runtime.
  <ButtonBase {...(rest as ButtonBaseProps)} className={cx("scnx-icon-button", className)} data-variant={variant} data-size={size} data-shape={shape} />
);

IconButton.displayName = "IconButton";
