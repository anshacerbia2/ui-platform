import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { FlyoutContextValue, FlyoutState } from "./types";

/**
 * FlyoutContext - Shared state for the Flyout system.
 */
const FlyoutContext = createContext<FlyoutContextValue | null>(null);
FlyoutContext.displayName = "FlyoutContext";

/**
 * Hook to manage Flyout state values.
 */
export const useFlyoutContextValue = (): FlyoutContextValue => {
  const flyoutQueue = useRef<FlyoutState | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<FlyoutState | null>(null);
  const [isFlyoutClosing, setIsFlyoutClosing] = useState(false);

  const closeFlyout = useCallback(() => {
    setIsFlyoutClosing(true);
  }, []);

  const setFlyout = useCallback(
    (ownerId: string, triggerRef: HTMLElement, content: ReactNode) => {
      if (activeFlyout) {
        if (activeFlyout.ownerId === ownerId) {
          flyoutQueue.current = null;
          setIsFlyoutClosing((prev) => !prev);
        } else {
          flyoutQueue.current = {
            ownerId,
            triggerRef,
            content,
          };
          closeFlyout();
        }
      } else {
        flyoutQueue.current = null;
        setActiveFlyout({
          ownerId,
          triggerRef,
          content,
        });
        setIsFlyoutClosing(false);
      }
    },
    [activeFlyout, closeFlyout],
  );

  const cleanupFlyout = useCallback(() => {
    setIsFlyoutClosing(false);

    if (flyoutQueue.current) {
      setActiveFlyout(flyoutQueue.current);
      flyoutQueue.current = null;
    } else {
      setActiveFlyout(null);
    }
  }, []);

  return useMemo(
    () => ({
      activeFlyout,
      isFlyoutClosing,
      setFlyout,
      closeFlyout,
      cleanupFlyout,
    }),
    [activeFlyout, isFlyoutClosing, setFlyout, closeFlyout, cleanupFlyout],
  );
};

/**
 * Hook to consume FlyoutContext.
 */
export const useFlyout = () => {
  const context = use(FlyoutContext);
  if (!context) {
    throw new Error("useFlyout must be used within a FlyoutProvider");
  }
  return context;
};

/**
 * FlyoutProvider - Shared state provider for the Flyout system.
 */
export const FlyoutProvider = ({ children }: { children: ReactNode }) => {
  const flyoutContextValue = useFlyoutContextValue();

  return (
    <FlyoutContext value={flyoutContextValue}>
      {children}
    </FlyoutContext>
  );
};
FlyoutProvider.displayName = "FlyoutProvider";

/**
 * InsideFlyoutContext - Context to detect if component is rendered inside a flyout.
 */
const InsideFlyoutContext = createContext<boolean>(false);
InsideFlyoutContext.displayName = "InsideFlyoutContext";

/**
 * Hook to consume InsideFlyoutContext.
 */
export const useInsideFlyout = () => use(InsideFlyoutContext);

/**
 * InsideFlyoutProvider - Provider to mark components as inside a flyout.
 */
export const InsideFlyoutProvider = ({ children }: { children: ReactNode }) => (
  <InsideFlyoutContext value={true}>
    {children}
  </InsideFlyoutContext>
);
InsideFlyoutProvider.displayName = "InsideFlyoutProvider";
