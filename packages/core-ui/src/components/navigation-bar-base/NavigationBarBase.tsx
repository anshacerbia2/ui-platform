import type { NavigationBarBaseRootProps } from "./types";
import { NavigationBase } from "../navigation-base";
import { NavigationBarBaseRoot as Root } from "./NavigationBarBaseRoot";
import { NavigationBarBaseStart as Start } from "./NavigationBarBaseStart";
import { NavigationBarBaseCenter as Center } from "./NavigationBarBaseCenter";
import { NavigationBarBaseEnd as End } from "./NavigationBarBaseEnd";

/**
 * Navigation component for the NavigationBarBase.
 * Directly aliases `NavigationBase`.
 */
export const NavigationBarBaseNav = NavigationBase;

const NavigationBarBaseCompound = ({ ...rest }: NavigationBarBaseRootProps) => <Root {...rest} />;
NavigationBarBaseCompound.displayName = "NavigationBarBase";

/**
 * NavigationBarBase - Professional Headless Navigation Bar foundation.
 *
 * Coordinates top-level application navigation structure.
 *
 * @example
 * ```tsx
 * import { NavigationBarBase } from "@scnx/core-ui";
 * 
 * const MyAppHeader = () => (
 *   <NavigationBarBase>
 *     <NavigationBarBase.Start>Logos</NavigationBarBase.Start>
 *     <NavigationBarBase.Center>
 *       <NavigationBarBase.Nav>Links</NavigationBarBase.Nav>
 *     </NavigationBarBase.Center>
 *     <NavigationBarBase.End>Actions</NavigationBarBase.End>
 *   </NavigationBarBase>
 * );
 * ```
 */
export const NavigationBarBase = Object.assign(NavigationBarBaseCompound, {
  Root,
  Start,
  Center,
  End,
  Nav: NavigationBase,
});
