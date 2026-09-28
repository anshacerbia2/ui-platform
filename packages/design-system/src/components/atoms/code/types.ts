import type { ComponentPropsWithRef, ReactNode } from "react";

export type CodeProps = {
  /** The content to render. */
  children: ReactNode;
  /** Visual intent of the code block. */
  intent?: "primary" | "info" | "success" | "warning" | "danger";
} & Omit<ComponentPropsWithRef<"code">, "intent">;
