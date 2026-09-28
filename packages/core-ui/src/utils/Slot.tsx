import * as React from 'react';

/**
 * Advanced Slot Engine - Radix-Parity Edition.
 * 
 * Provides a polymorphic proxy for the `asChild` pattern, supporting:
 * - Intelligent prop merging (className, style, events)
 * - Slottable support for complex children
 * - React 18/19 Ref transparency
 * - Lazy component synchronization
 */

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type AnyProps = Record<string, any>;

/**
 * Contract for components supporting polymorphic composition and dynamic rendering.
 * 
 * **Objective**: Safely extends native HTML attribute contracts for a given DOM 
 * tag or React element type while conditionally exposing the `asChild` composition flag.
 * 
 * @remarks
 * **Composition Mechanics**
 * - **Overlapping Omit**: Automatically strips `asChild` and custom user props 
 *   from the underlying HTML attribute contract to prevent TS compiler bailouts.
 * - **Ref Transmission**: Transmits the underlying element's exact Ref type 
 *   dynamically based on the selected ElementType `E`.
 */
export type SlotProps<E extends React.ElementType = 'div', P = {}> = Omit<
  React.ComponentPropsWithRef<E>,
  'asChild' | keyof P
> & { asChild?: boolean } & P;

/**
 * Properties for the internal Slot component representation.
 */
interface InternalSlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const REACT_LAZY_TYPE = Symbol.for('react.lazy');

interface LazyReactElement extends React.ReactElement {
  $$typeof: typeof REACT_LAZY_TYPE;
  _payload: PromiseLike<Exclude<React.ReactNode, PromiseLike<any>>>;
}

/* -------------------------------------------------------------------------------------------------
 * Internals
 * -----------------------------------------------------------------------------------------------*/

const use: any = (React as any)['use'.trim()];

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof value === 'object' && value !== null && 'then' in value;
}

function isLazyComponent(element: React.ReactNode): element is LazyReactElement {
  return (
    element != null &&
    typeof element === 'object' &&
    '$$typeof' in element &&
    element.$$typeof === REACT_LAZY_TYPE &&
    '_payload' in element &&
    isPromiseLike(element._payload)
  );
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node);
      else if (ref != null) (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

function getElementRef(element: React.ReactElement) {
  // Safe ref access for React 18 & 19
  // @ts-ignore
  let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
  let mayWarn = getter && 'isReactWarning' in getter && (getter as any).isReactWarning;
  if (mayWarn) {
    return (element as any).ref;
  }

  // @ts-ignore
  getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  mayWarn = getter && 'isReactWarning' in getter && (getter as any).isReactWarning;
  if (mayWarn) {
    return (element.props as any).ref;
  }

  return (element.props as any).ref || (element as any).ref;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  const mergedProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        mergedProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        mergedProps[propName] = slotPropValue;
      }
    } else if (propName === 'style') {
      mergedProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === 'className') {
      mergedProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
    }
  }

  return { ...slotProps, ...mergedProps };
}

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

/**
 * Slot - A native, high-performance polymorphic layout proxy component.
 * 
 * **Objective**: Enables clean component composition (`asChild` pattern) 
 * by merging layout attributes, styles, events, and React refs onto its 
 * immediate child element without introducing an extra wrapper DOM node.
 * 
 * @example
 * ```tsx
 * // Compiles directly to <button ref={ref} class="btn custom-btn">Click</button>
 * <Slot className="custom-btn" ref={ref}>
 *   <button className="btn">Click</button>
 * </Slot>
 * ```
 * 
 * @remarks
 * **Architecture & Mechanics**
 * - **Polymorphism Engine**: Intercepts props passed to the Slot and merges them 
 *   with the child component's props (event handlers, styles, classNames).
 * - **Composition Pipeline**: Scans children list to locate a `<Slottable>` 
 *   placeholder, replacing it with sibling nodes to support complex content.
 * - **Ref Management**: Safely chains incoming refs with child element refs 
 *   using a non-leaking, multi-version React 18/19 ref composition engine.
 * 
 * @param props - Custom layout attributes, event handlers, and children.
 * @returns A cloned React element containing the merged props and references.
 */
export const Slot = React.forwardRef<HTMLElement, InternalSlotProps>((props, forwardedRef) => {
  let { children, ...slotProps } = props;

  if (isLazyComponent(children) && typeof use === 'function') {
    children = use((children as LazyReactElement)._payload);
  }

  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable) as React.ReactElement<{ children: React.ReactNode }> | undefined;

  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (React.Children.count(newElement) > 1) return React.Children.only(null);
        return React.isValidElement(newElement)
          ? (newElement.props as { children: React.ReactNode }).children
          : null;
      }
      return child;
    });

    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {React.isValidElement(newElement)
          ? React.cloneElement(newElement, undefined, newChildren)
          : null}
      </SlotClone>
    );
  }

  return (
    <SlotClone {...slotProps} ref={forwardedRef}>
      {children}
    </SlotClone>
  );
});

(Slot as any).displayName = 'Slot';

/* -------------------------------------------------------------------------------------------------
 * SlotClone
 * -----------------------------------------------------------------------------------------------*/

const SlotClone = React.forwardRef<any, { children: React.ReactNode }>((props, forwardedRef) => {
  let { children, ...slotProps } = props;

  if (isLazyComponent(children) && typeof use === 'function') {
    children = use((children as LazyReactElement)._payload);
  }

  if (React.isValidElement(children)) {
    const childrenRef = getElementRef(children);
    const merged = mergeProps(slotProps, children.props as AnyProps);

    if (children.type !== React.Fragment) {
      merged.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
    }

    return React.cloneElement(children, merged);
  }

  return React.Children.count(children) > 1 ? React.Children.only(null) : null;
});

(SlotClone as any).displayName = 'SlotClone';

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

const SLOTTABLE_IDENTIFIER = Symbol('scnx.slottable');

/**
 * Slottable - A layout placeholder component used inside custom Slot structures.
 * 
 * **Objective**: Marks the location where the consumer's nested children should 
 * be injected when utilizing complex layout structures under the `asChild` pattern.
 * 
 * @param props - An object containing the children to be slotted.
 * @returns React element containing the children.
 */
export const Slottable = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

(Slottable as any).__scnxId = SLOTTABLE_IDENTIFIER;

function isSlottable(child: React.ReactNode): child is React.ReactElement {
  return (
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    (child.type as any).__scnxId === SLOTTABLE_IDENTIFIER
  );
}
