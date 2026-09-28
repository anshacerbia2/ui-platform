import type { ReactNode } from "react";
import type { 
  CodeShowcaseBaseRootProps as BaseRootProps, 
  CodeShowcaseBasePreviewProps as BasePreviewProps,
  CodeShowcaseBaseNavProps as BaseNavProps, 
  CodeShowcaseBaseTriggerProps as BaseTriggerProps,
  CodeShowcaseBaseContentProps as BaseContentProps
} from "@scnx/core-ui/components/code-showcase-base";

export type CodeShowcaseRootProps = BaseRootProps & {
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};
export type CodeShowcasePreviewProps = BasePreviewProps;
export type CodeShowcaseNavProps = BaseNavProps;
export type CodeShowcaseContentProps = BaseContentProps;

export type CodeShowcaseTriggerProps = Omit<BaseTriggerProps, "children"> & {
  children: ReactNode | ((props: { isOpen: boolean; isClosing: boolean }) => ReactNode);
};
