import { cx } from "styled-system/css";
import type { AvatarGroupProps } from "./types";

/**
 * AvatarGroup - avatars that overlap, as one group (`role="group"`) the
 * consumer names. Each avatar is ringed in the canvas so the edges read.
 *
 * @example
 * ```tsx
 * import { Avatar } from "@scnx/system/components/avatar";
 * import { AvatarGroup } from "@scnx/system/components/avatar-group";
 *
 * <AvatarGroup aria-label="Reviewers">
 *   <Avatar name="Ana Nugraha" />
 *   <Avatar name="Budi Santoso" />
 * </AvatarGroup>
 * ```
 */
export const AvatarGroup = ({ className, ...rest }: AvatarGroupProps) => <div role="group" {...rest} className={cx("scnx-avatar-group", className)} />;

AvatarGroup.displayName = "AvatarGroup";
