import { type ReactNode, Children, isValidElement } from "react";
import type { NavigableChildProps } from "./types";

/**
 * Recursively checks if the active path matches the current item or any of its descendants.
 * This is primarily used to determine if a Sidebar Group should auto-expand relative to the current active route.
 *
 * @param {string} activePath - The current active route path (e.g., from `useLocation().pathname`).
 * @param itemPath - The specific path associated with the current navigation item, if any.
 * @param children - The React children of the item to inspect recursively.
 * @returns `true` if the `activePath` matches the `itemPath` or is found within the `children` tree; otherwise `false`.
 */
export const checkPathMatchRecursive = (
  activePath: string,
  itemPath: string | undefined,
  children: ReactNode,
): boolean => {
  if (!activePath) return false;

  const isSelfMatch =
    itemPath &&
    (activePath === itemPath || activePath.startsWith(`${itemPath}/`));
 
    if (isSelfMatch) return true;

  const isPathInSubtree = (node: ReactNode, targetPath: string): boolean => {
    return Children.toArray(node).some((child) => {
      if (!isValidElement<NavigableChildProps>(child)) return false;
      const props = child.props;
      const childPath = props.to || props.href;

      if (childPath === targetPath) return true;

      if (props.children) {
        return isPathInSubtree(props.children, targetPath);
      }
      return false;
    });
  };

  return isPathInSubtree(children, activePath);
};
