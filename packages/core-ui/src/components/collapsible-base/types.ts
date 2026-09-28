import type { ReactNode, HTMLAttributes } from "react";
import type { DisclosureRegistryOptions } from "../disclosure-base/types";

/**
 * Props for the CollapsibleBaseRoot component.
 */
export type CollapsibleBaseRootProps = DisclosureRegistryOptions & HTMLAttributes<HTMLDivElement>;

/**
 * Props for the CollapsibleBaseItem component.
 */
export type CollapsibleBaseItemProps = {
  /** The unique key for this item in the registry */
  value?: string;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Open state (controlled) */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether this item participates in the parent registry orchestration */
  orchestrated?: boolean;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Props for the CollapsibleBaseTrigger component.
 */
export type CollapsibleBaseTriggerProps = Omit<HTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode | ((props: { isOpen: boolean; isClosing: boolean }) => ReactNode);
  className?: string;
};

/**
 * Props for the CollapsibleBaseContent component.
 */
export type CollapsibleBaseContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  /** Whether to keep the content in the DOM even when closed */
  forceMount?: boolean;
  /** Whether to disable height transitions for this specific content */
  disabledAnimations?: boolean;
};

