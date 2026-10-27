import type { ComponentPropsWithRef } from "react";

export type AvatarProps = Omit<ComponentPropsWithRef<"span">, "children" | "role"> & {
  /** The person's or organization's name: the avatar's accessible name, and the source of its initials. */
  name: string;
  /** An image; the initials show while it is missing or fails to load. */
  src?: string;
  /** `small` 24px, `medium` 32px, `large` 40px. @default "medium" */
  size?: "small" | "medium" | "large";
  /** `circle` for people, `square` for workspaces and organizations. @default "circle" */
  shape?: "circle" | "square";
  /** A status dot, named by this text in the avatar's name, such as "online". */
  status?: string;
  /** The name is already written beside the avatar: hide it from assistive technology. @default false */
  decorative?: boolean;
};

export type AvatarGroupProps = ComponentPropsWithRef<"div">;
