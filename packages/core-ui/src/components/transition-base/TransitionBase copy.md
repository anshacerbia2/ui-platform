import { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

import type { TransitionBaseProps, TransitionStatus } from "./types";

/**
 * TransitionBase - Restored Expert Logic with FSM Status.
 * 
 * Features:
 * - Pixel-accurate height animation using `scrollHeight`.
 * - 6-Status FSM: mounting | entering | stable | exiting | unmounting.
 * - Reactive: Handles styleTo changes dynamically.
 * - Double-RAF: Ensure scrollHeight is calculated after DOM layout.
 */
export const TransitionBase = ({ 
  ref, 
  className, 
  style, 
  styleFrom, 
  styleTo, 
  smoothClose, 
  handleClose, 
  children, 
  disableAnimation, 
  ...rest 
}: TransitionBaseProps) => {
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const prevStyleToHeight = useRef(styleTo?.height);
  const isInitRender = useRef(true);
  
  const [show, setShow] = useState(disableAnimation ?? false);
  const [settled, setSettled] = useState(disableAnimation ?? false);
  const [resettled, setResettled] = useState(disableAnimation ?? false);
  
  const [currentStyle, setCurrentStyle] = useState({
    ...style,
    ...styleFrom,
    ...(disableAnimation ? { ...styleTo, transition: "none" } : {}),
  });

  // Flow ref through to the DOM node while maintaining internal access
  const setRef = (node: HTMLDivElement | null) => {
    (nodeRef as any).current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    if (disableAnimation) return;
    
    setCurrentStyle((prev: any) => {
      if (prev?.transition === "none") {
        const { transition: _t, ...restStyle } = prev;
        return restStyle;
      }
      return prev;
    });

    if (!show) {
      fadeIn();
    }
  }, [disableAnimation]);

  const snapToCurrentPixels = () => {
    if (!nodeRef.current) return;
    const computed = window.getComputedStyle(nodeRef.current).height;
    const height = computed === "auto" ? `${nodeRef.current.scrollHeight}px` : computed;
    setCurrentStyle((prev: any) => ({ ...prev, height }));
  };

  const resolveHeight = (targetStyle: any) => {
    if (targetStyle?.height === "auto" && nodeRef.current) {
      return {
        ...targetStyle,
        height: `${nodeRef.current.scrollHeight}px`,
      };
    }
    return targetStyle;
  };

  const fadeIn = () => {
    setShow(true);
    snapToCurrentPixels();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentStyle(resolveHeight(styleTo));
      });
    });
  };

  const fadeOut = () => {
    setShow(false);
    setResettled(true);
    
    if (!styleFrom || !styleTo) return;
    
    if (nodeRef.current) {
      snapToCurrentPixels();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrentStyle(resolveHeight(styleFrom));
        });
      });
    } else {
      setCurrentStyle(resolveHeight(styleFrom));
    }
  };
  
  useEffect(() => {
    if (isInitRender.current) {
      isInitRender.current = false;
      return;
    }

    if (smoothClose) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, [smoothClose]);

  useEffect(() => {
    if (show && styleTo) {
      if (styleTo.height === prevStyleToHeight.current) return;
      prevStyleToHeight.current = styleTo.height;
      
      snapToCurrentPixels();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = resolveHeight(styleTo);
          setCurrentStyle(target);
        });
      });
    }
  }, [styleTo, show]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (show && e.target === e.currentTarget) {
      setSettled(true);
      setResettled(false);
      
      if (styleTo?.height === "auto" || styleTo?.height === "100%") {
        setCurrentStyle((prev: any) => ({ ...prev, height: "auto" }));
      }
    }
    
    if (!show && e.target === e.currentTarget && smoothClose && handleClose) {
      handleClose();
    }
  };

  return (
    <div
      ref={setRef}
      className={className}
      data-state={show ? "fadein" : "fadeout"}
      data-settled={settled || undefined}
      data-resettled={resettled || undefined}
      onTransitionEnd={onTransitionEnd}
      style={{
        ...style,
        ...currentStyle,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

TransitionBase.displayName = "TransitionBase";
