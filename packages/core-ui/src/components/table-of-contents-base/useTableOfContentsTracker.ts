import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import type { UseTableOfContentsTrackerProps, TableOfContentsItemState } from "./types";

/**
 * Hook to manage Table of Contents state, including active section tracking
 * and smooth scrolling to sections.
 * 
 * Internal Logic Tracker for TableOfContentsBaseRoot.
 */
export function useTableOfContentsTracker({ 
  items, 
  scrollOffsetExtended = 36, 
  navbarOffset: explicitNavbarOffset,
  initialActiveId 
}: UseTableOfContentsTrackerProps) {
  const isAutomaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial state logic: 
  // MUST be consistent between Server and Client to avoid hydration mismatch.
  const [activeId, setActiveId] = useState<string | null>(() => {
    return initialActiveId ?? (items && items.length > 0 ? items[0].id : null);
  });

  const [navHeight, setNavHeight] = useState(explicitNavbarOffset ?? 0);

  // Without an explicit offset, use the document's scroll-padding-top: the
  // CSS-standard declaration of a fixed header's height (CSS Scroll Snap 1).
  // A headless primitive reads no design token.
  useEffect(() => {
    if (explicitNavbarOffset !== undefined) {
      setNavHeight(explicitNavbarOffset);
      return;
    }

    const updateNavHeight = () => {
      // Computed scroll-padding is either "auto" or a resolved length in px.
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
      setNavHeight(Number.isNaN(padding) ? 0 : padding);
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    return () => window.removeEventListener("resize", updateNavHeight);
  }, [explicitNavbarOffset]);

  const totalOffset = navHeight + scrollOffsetExtended;

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      isAutomaticScrollRef.current = true;
      setActiveId(id);
      
      const yOffset = -totalOffset;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      
      window.scrollTo({ top: y, behavior: "smooth" });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isAutomaticScrollRef.current = false;
      }, 800);
    }
  }, [totalOffset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutomaticScrollRef.current) return;

        // Find the first entry that is intersecting
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: `-${totalOffset}px 0px -80% 0px`,
        threshold: 0,
      }
    );

    const observeRecursive = (tocArray: TableOfContentsItemState[]) => {
      tocArray.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
        
        if (item.subcontent && item.subcontent.length > 0) {
          observeRecursive(item.subcontent);
        }
      });
    };

    observeRecursive(items);

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [items, totalOffset]);

  // Scroll to hash on mount (if valid hash exists)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const timer = setTimeout(() => {
        scrollTo(hash);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scrollTo]);

  return useMemo(() => ({
    activeId,
    setActiveId,
    scrollTo,
  }), [activeId, scrollTo]);
}
