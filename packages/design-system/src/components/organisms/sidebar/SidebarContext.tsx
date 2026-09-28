"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FlyoutProvider } from "./FlyoutContext";
import type { SidebarContextValue, SidebarProviderProps } from "./types";

const SidebarContext = createContext<SidebarContextValue | null>(null);
SidebarContext.displayName = "SidebarContext";

export const useSidebarContextValue = ({
  activePath,
  defaultIsOpen = true,
}: Pick<
  SidebarProviderProps,
  "activePath" | "defaultIsOpen"
>): SidebarContextValue => {
  const [internalActivePath, setInternalActivePath] = useState(
    activePath || "",
  );
  const [internalIsOpen, setInternalIsOpen] = useState(defaultIsOpen);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setInternalActivePath(activePath || "");
  }, [activePath]);

  const setIsOpen = useCallback((value: boolean) => {
    setInternalIsOpen(value);
  }, []);

  const toggleOpen = useCallback(() => {
    setInternalIsOpen((prev) => !prev);
  }, []);

  const setExpanded = useCallback((id: string, value: boolean) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  return useMemo(
    () => ({
      activePath: internalActivePath,
      isOpen: internalIsOpen,
      expandedMap,
      setIsOpen,
      toggleOpen,
      setExpanded,
      toggleExpanded,
    }),
    [
      internalActivePath,
      internalIsOpen,
      expandedMap,
      setIsOpen,
      toggleOpen,
      setExpanded,
      toggleExpanded,
    ],
  );
};

/**
 * Hook to consume SidebarContext.
 */
export const useSidebar = () => {
  const context = use(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

/**
 * Provides state management for the Sidebar system.
 * Handles active path tracking, open/closed state, and item expansion.
 */
export const SidebarProvider = ({
  children,
  activePath,
  defaultIsOpen = true,
  withFlyout = true,
}: SidebarProviderProps) => {
  const sidebarContextValue = useSidebarContextValue({
    activePath,
    defaultIsOpen,
  });

  const content = useMemo(() => {
    return withFlyout ? <FlyoutProvider>{children}</FlyoutProvider> : children;
  }, [withFlyout, children]);

  return (
    <SidebarContext value={sidebarContextValue}>
      {content}
    </SidebarContext>
  );
};
SidebarProvider.displayName = "SidebarProvider";
