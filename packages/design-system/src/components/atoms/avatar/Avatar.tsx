import { useState } from "react";
import { cx } from "styled-system/css";
import type { AvatarGroupProps, AvatarProps } from "./types";

/** Two letters: the first of the first and the last word, or the first two of one word. */
export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const letters = words.length === 1 ? [...words[0]].slice(0, 2) : [[...words[0]][0], [...words.at(-1)!][0]];
  return letters.join("").toLocaleUpperCase();
};

/**
 * Avatar - a person (circle) or an organization (square), as an image or its
 * initials. It is an image named by `name` (and its `status`, if any); with
 * `decorative`, for a name already written beside it, it is hidden from
 * assistive technology. The initials show while the image is missing or fails.
 *
 * @example
 * ```tsx
 * import { Avatar, AvatarGroup } from "@scnx/system/components/avatar";
 *
 * <Avatar name="Ana Nugraha" src="/ana.jpg" status="online" />
 * <AvatarGroup aria-label="Reviewers"><Avatar name="Ana Nugraha" /><Avatar name="Budi Santoso" /></AvatarGroup>
 * ```
 */
export const Avatar = ({ name, src, size = "medium", shape = "circle", status, decorative = false, className, ...rest }: AvatarProps) => {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(src) && failed !== src;
  const label = status ? `${name}, ${status}` : name;
  return (
    <span
      {...rest}
      className={cx("scnx-avatar", className)}
      data-size={size}
      data-shape={shape}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
    >
      {showImage ? (
        <img data-part="image" src={src} alt="" onError={() => setFailed(src ?? null)} />
      ) : (
        <span data-part="initials" aria-hidden="true">
          {initialsOf(name)}
        </span>
      )}
      {status && <span data-part="status" aria-hidden="true" />}
    </span>
  );
};

/** Avatars that overlap, as one named group. */
export const AvatarGroup = ({ className, ...rest }: AvatarGroupProps) => <div role="group" {...rest} className={cx("scnx-avatar-group", className)} />;

Avatar.displayName = "Avatar";
AvatarGroup.displayName = "AvatarGroup";
