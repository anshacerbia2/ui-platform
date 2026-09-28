"use client";

import { createContext } from "../../utils/create-context";

/**
 * Context for the EdgeLayout state.
 * Ensures that layout regions (Navbar, Sidebar, Content) are always rendered
 * within an EdgeLayoutRoot to maintain structural integrity.
 */
export const [EdgeLayoutContext, useEdgeLayoutContext] = 
  createContext<boolean>("EdgeLayout");
