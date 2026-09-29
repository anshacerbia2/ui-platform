import type { CSSProperties, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useOnClickOutside } from "@scnx/core-ui/hooks/use-on-click-outside";

import type { SidebarFlyoutProps } from "./types";
import { Transition } from "../../atoms/transition";
import { InsideFlyoutProvider, useFlyout } from "./FlyoutContext";
import { cx } from "styled-system/css";

/**
 * SidebarFlyout - Tier 1 Organism Component.
 * 
 * Floating flyout menu for the Sidebar.
 * Displays sub-navigation items when the Sidebar is collapsed.
 * Renders via `React Portal` to the `document.body`.
 * 
 * @example
 * ```tsx
 * import { Sidebar } from "@scnx/system/components/sidebar";
 * 
 * <Sidebar>
 *   <Sidebar.Nav>...</Sidebar.Nav>
 * </Sidebar>
 * ```
 */
export const SidebarFlyout = ({
  className = "",
  width,
  variant = "dark",
}: SidebarFlyoutProps) => {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const { activeFlyout, isFlyoutClosing, closeFlyout, cleanupFlyout } =
    useFlyout();
  const [pos, setPos] = useState<CSSProperties>({});

  const refs = useMemo(() => {
    return activeFlyout?.triggerRef
      ? [flyoutRef as RefObject<HTMLElement>, activeFlyout.triggerRef]
      : null;
  }, [activeFlyout?.triggerRef]);

  const handleClickOutside = useCallback(() => {
    if (activeFlyout) {
      closeFlyout();
    }
  }, [activeFlyout, closeFlyout]);

  useOnClickOutside(refs, activeFlyout ? handleClickOutside : undefined);

  useEffect(() => {
    if (!activeFlyout?.triggerRef || !flyoutRef.current) return;

    let rafId: number;
    let prevPosJSON = "";

    const updatePosition = () => {
      const triggerEl = activeFlyout?.triggerRef;
      const flyoutEl = flyoutRef.current;
      if (!triggerEl || !flyoutEl) return;

      const li = triggerEl.parentElement;
      const triggerRect = li?.getBoundingClientRect();
      if (!triggerRect) return;

      const sidebar = li?.closest(".scnx-sidebar");
      const sidebarRect = sidebar?.getBoundingClientRect();

      const containerBottom = sidebarRect?.bottom ?? window.innerHeight;
      const containerTop = sidebarRect?.top ?? 0;

      const spaceAbove = triggerRect.bottom - containerTop;
      const spaceBelow = containerBottom - triggerRect.top;

      const left = triggerRect.left + triggerRect.width;

      const useBottomAnchor = spaceAbove > spaceBelow;

      let newPos: CSSProperties = {};
      const widthVal = typeof width === "number" ? `${width}px` : width;

      if (useBottomAnchor) {
        const stickBottomEdge = Math.min(triggerRect.bottom, containerBottom);
        const bottomValue = window.innerHeight - stickBottomEdge;
        const availableHeight = stickBottomEdge - containerTop;

        newPos = {
          position: "fixed",
          top: "auto",
          bottom: bottomValue,
          left,
          width: widthVal,
          maxHeight: `${availableHeight}px`,
        };
      } else {
        const stickTopEdge = Math.max(triggerRect.top, containerTop);
        const availableHeight = containerBottom - stickTopEdge;

        newPos = {
          position: "fixed",
          top: stickTopEdge,
          bottom: "auto",
          left,
          width: widthVal,
          maxHeight: `${availableHeight}px`,
        };
      }

      const newPosJSON = JSON.stringify(newPos);
      if (newPosJSON !== prevPosJSON) {
        setPos(newPos);
        prevPosJSON = newPosJSON;
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => cancelAnimationFrame(rafId);
  }, [width, activeFlyout?.triggerRef]);

  if (typeof document === "undefined" || !activeFlyout?.content) return null;

  return createPortal(
    <div ref={flyoutRef} className={cx("scnx-sidebar__flyout", className)} style={pos} data-variant={variant}>
      <Transition
        key={activeFlyout.ownerId}
        smoothClose={isFlyoutClosing}
        onClosed={() => {
          cleanupFlyout();
        }}
        styleFrom={{ height: 0 }}
        styleTo={{ height: "auto" }}
      >
        <div>
          <div style={{ maxHeight: `calc(${pos.maxHeight} - 2rem)` }}>
            <InsideFlyoutProvider>{activeFlyout.content}</InsideFlyoutProvider>
          </div>
        </div>
      </Transition>
    </div>,
    document.body,
  );
};

SidebarFlyout.displayName = "SidebarFlyout";
