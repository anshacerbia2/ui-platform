import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from "react";

/**
 * Universal Polymorphic Type Helpers
 * "God Level" standard for Reactor components.
 */

export type As = ElementType;

/**
 * Extract the props of a React element or component (including Ref).
 */
export type PropsOf<E extends As> = ComponentPropsWithRef<E>;

/**
 * The core Polymorphic logic. 
 * - Includes ALL props from E (including ref)
 * - Merges with custom props P
 * - Omits 'as' and keys from P to avoid collisions
 */
export type PolymorphicProps<E extends As, P = {}> = P &
  Omit<PropsOf<E>, keyof P | "as"> & {
    as?: E;
  };

/**
 * Extract the Ref type from an element.
 */
export type PolymorphicRef<E extends As> = PropsOf<E>["ref"];

/**
 * Standard Polymorphic Component interface.
 * Supports forwardRef and displayName out of the box.
 */
export interface PolymorphicComponent<P = {}> {
  <E extends As = any>(props: PolymorphicProps<E, P>): ReactElement | null;
  displayName?: string;
}
