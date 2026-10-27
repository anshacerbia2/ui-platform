import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

/** A loading row matching the real one: an avatar, a name, and a line of detail. */
export const Row: StoryObj<typeof meta> = {
  render: () => (
    <section aria-busy="true" aria-label="Members" style={{ display: "flex", gap: "0.75rem", inlineSize: "20rem" }}>
      <Skeleton shape="circle" style={{ inlineSize: "2rem" }} />
      <div style={{ display: "grid", gap: "0.5rem", flex: 1 }}>
        <Skeleton style={{ inlineSize: "60%" }} />
        <Skeleton style={{ inlineSize: "90%" }} />
      </div>
    </section>
  ),
};

/** A block at the control radius, for a card or a chart. */
export const Block: StoryObj<typeof meta> = {
  render: () => <Skeleton shape="block" style={{ inlineSize: "20rem", blockSize: "6rem" }} />,
};
