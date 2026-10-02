import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";

// `asChild` composition (TDD primitives, "Polymorphism"; STD-UIP-PRM-001):
// - exactly one React element child, else a deterministic error before cloning;
// - the child's props win; className joins as "slot child", style keys merge
//   with the child's last;
// - for an event handler on both, the child's (consumer's) runs first and
//   the slot's (library's) runs only if the event was not default-prevented;
//   an exception in the child's handler propagates and stops the library's;
// - refs compose: the slot's ref and the child's ref both receive the node.

type AnyProps = Record<string, unknown>;
type Handler = (event: unknown, ...rest: unknown[]) => void;

export type SlotProps = { children?: ReactNode; ref?: Ref<HTMLElement> } & AnyProps;

/** A ref callback that sets every given ref. */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

const isPrevented = (event: unknown) =>
  typeof event === "object" && event !== null && (event as { defaultPrevented?: boolean }).defaultPrevented === true;

/** Merge slot (library) props under child (consumer) props. */
export function mergeSlotProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };
  for (const name of Object.keys(slotProps)) {
    const slotValue = slotProps[name];
    const childValue = childProps[name];
    if (/^on[A-Z]/.test(name) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[name] = (event: unknown, ...rest: unknown[]) => {
        (childValue as Handler)(event, ...rest);
        if (!isPrevented(event)) (slotValue as Handler)(event, ...rest);
      };
    } else if (name === "className" && slotValue && childValue) {
      merged[name] = `${String(slotValue)} ${String(childValue)}`;
    } else if (name === "style" && slotValue && childValue) {
      merged[name] = { ...(slotValue as object), ...(childValue as object) };
    }
  }
  return merged;
}

function describe(children: ReactNode): string {
  const count = Children.count(children);
  if (count !== 1) return `${count} children`;
  return isValidElement(children) ? "a Fragment" : `a ${typeof children} child`;
}

/**
 * Slot - renders its single element child with the slot's props merged in,
 * for the `asChild` pattern. It adds no DOM node.
 */
export const Slot = ({ children, ref, ...slotProps }: SlotProps): ReactElement => {
  if (Children.count(children) !== 1 || !isValidElement(children) || children.type === Fragment) {
    throw new Error(`asChild expects exactly one React element child that renders a DOM node; received ${describe(children)}.`);
  }
  const childProps = children.props as AnyProps;
  const merged = mergeSlotProps(slotProps, childProps);
  merged.ref = composeRefs(ref, childProps.ref as Ref<HTMLElement> | undefined);
  return cloneElement(children as ReactElement<AnyProps>, merged);
};

Slot.displayName = "Slot";
