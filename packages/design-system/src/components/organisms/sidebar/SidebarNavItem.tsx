"use client";

import type { MouseEvent } from "react";
import { Children, isValidElement, useEffect, useRef, useState } from "react";

import {
  NavigationLevelContext,
  useNavigationLevel,
} from "@scnx/core-ui/components/navigation-base";

import { Transition } from "../../atoms/transition";
import { Navigation } from "../navigation";

import { useFlyout } from "./FlyoutContext";
import { useSidebar } from "./SidebarContext";
import { checkPathMatchRecursive } from "./utils";

/**
 * SidebarNavItem - Tier 1 Organism Component.
 *
 * Individual navigation item for the Sidebar.
 * Extends `Navigation.Item` with Sidebar-specific state (collapsible content, flyouts).
 * Renders a semantic `<li>` wrapper via `Navigation.Item`.
 */
export const SidebarNavItem = ({
  isActive: controlledIsActive,
  onClick,
  children,
  ...rest
}: any) => {
  const initRender = useRef(true);

  const ownerId = rest.id || rest.to || rest.href || rest.label || "";
  const itemPath = (rest.to || rest.href) as string | undefined;

  const currentLevel = useNavigationLevel();
  const { activePath, isOpen, expandedMap, setExpanded, toggleExpanded } =
    useSidebar();
  const { setFlyout, closeFlyout } = useFlyout();

  const [showContent, setShowContent] = useState(() => {
    const isInitialMatch = checkPathMatchRecursive(
      activePath || "",
      itemPath,
      children,
    );
    return rest.isExpanded ?? expandedMap[ownerId] ?? isInitialMatch;
  });
  const [isClosing, setIsClosing] = useState(false);

  const isActive =
    controlledIsActive ??
    ((activePath && itemPath === activePath) as boolean | undefined);
  const isExpanded = rest.isExpanded ?? expandedMap[ownerId] ?? showContent;

  const content =
    showContent && isValidElement(children) ? (
      <Transition
        disableAnimation={initRender.current && showContent}
        smoothClose={isClosing}
        onClosed={() => {
          setShowContent(false);
          setIsClosing(false);
        }}
        styleFrom={{ height: 0 }}
        styleTo={{ height: !isOpen && currentLevel === 0 ? 0 : "auto" }}
      >
        {children}
      </Transition>
    ) : null;

  useEffect(() => {
    if (
      expandedMap[ownerId] === undefined &&
      isExpanded &&
      Children.count(children)
    ) {
      setExpanded(ownerId, true);
    }
    initRender.current = false;
  }, []);

  useEffect(() => {
    if (isExpanded) {
      setShowContent(true);
      setIsClosing(false);
    } else if (showContent) {
      setIsClosing(true);
    }
  }, [isExpanded]);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    onClick?.(e as any);
    if (e.defaultPrevented) return;

    if (!isOpen) {
      if (currentLevel === 0) {
        if (isValidElement(children) && Children.count(children)) {
          setFlyout(
            ownerId,
            e.currentTarget as HTMLElement,
            <NavigationLevelContext.Provider value={currentLevel + 1}>
              {children}
            </NavigationLevelContext.Provider>,
          );
        }
      } else {
        if (
          isValidElement(children) &&
          Children.count(children) &&
          rest.isExpanded === undefined &&
          controlledIsActive === undefined
        ) {
          toggleExpanded(ownerId);
        } else {
          closeFlyout();
        }
      }
    } else if (
      isValidElement(children) &&
      Children.count(children) &&
      rest.isExpanded === undefined &&
      controlledIsActive === undefined
    ) {
      toggleExpanded(ownerId);
    }
  };

  return (
    <Navigation.Item
      onClick={handleClick}
      isActive={isActive}
      isExpanded={isExpanded}
      {...rest}
    >
      {content}
    </Navigation.Item>
  );
};

SidebarNavItem.displayName = "SidebarNavItem";
