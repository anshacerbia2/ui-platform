import type { ComponentPropsWithRef, ReactNode } from "react";

export type ProgressProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** How far the quantity has gone, from 0 to `max`. */
  value: number;
  /** The whole quantity. @default 100 */
  max?: number;
  /** The visible name of what is measured; it names the progress bar. */
  label: ReactNode;
  /** The formatted value, shown beside the label in tabular figures and read as the bar's value (`aria-valuetext`), such as "7.2 of 10 GB". */
  valueText?: string;
  /** `success` when complete, `danger` over a limit. @default "primary" */
  scheme?: "primary" | "success" | "danger";
};
