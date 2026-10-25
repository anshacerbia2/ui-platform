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
  activeId: controlledActiveId,
  defaultActiveId,
  onActiveIdChange,
}: UseTableOfContentsTrackerProps) {
  const isAutomaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  // Initial state logic:
  // MUST be consistent between Server and Client to avoid hydration mismatch.
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | null>(() => {
    return defaultActiveId ?? (items && items.length > 0 ? items[0].id : null);
  });

  // Controlled when `activeId` is passed, `null` included (TDD primitives P27).
  const controlled = controlledActiveId !== undefined;
  const activeId = controlled ? controlledActiveId : uncontrolledActiveId;

  // The observer and the scroll callback read the latest values without re-subscribing.
  const activeIdRef = useRef(activeId);
  const onChangeRef = useRef(onActiveIdChange);
  useEffect(() => {
    activeIdRef.current = activeId;
    onChangeRef.current = onActiveIdChange;
  });

  // Report only a change: the observer fires again for a heading already active.
  const setActiveId = useCallback((id: string) => {
    if (id === activeIdRef.current) return;
    activeIdRef.current = id;
    if (!controlled) setUncontrolledActiveId(id);
    onChangeRef.current?.(id);
  }, [controlled]);

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
      
      // Reduced motion jumps instead of animating (TDD primitives P19).
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

      // The programmatic scroll ends at `scrollend` where the engine has it;
      // the timer covers engines without it and a scroll that does not move,
      // which fires no `scrollend` (CSSOM View).
      releaseRef.current?.();
      const release = () => {
        isAutomaticScrollRef.current = false;
        window.removeEventListener("scrollend", release);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
        releaseRef.current = null;
      };
      releaseRef.current = release;
      if ("onscrollend" in window) window.addEventListener("scrollend", release);
      scrollTimeoutRef.current = setTimeout(release, reduce ? 100 : 1000);

      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
  }, [totalOffset, setActiveId]);

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
      releaseRef.current?.();
    };
  }, [items, totalOffset, setActiveId]);

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
  }), [activeId, setActiveId, scrollTo]);
}
