import type { SlotProps } from "../../utils/Slot";

export type ListBaseRootProps = SlotProps<"ul"> & {
  /** list semantic type. Default: "unordered" (ul) */
  type?: "unordered" | "ordered";
};
export type ListBaseItemProps = SlotProps<"li">;
