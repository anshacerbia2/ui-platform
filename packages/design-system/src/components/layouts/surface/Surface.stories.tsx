import type { Meta, StoryObj } from "@storybook/react-vite";
import { Surface } from "./Surface";

const meta = {
  title: "Layouts/Surface",
  component: Surface,
  args: { material: "raised", padding: "default", children: "A raised surface: cards and interactive tiles." },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {};

/** Every on-page material: tables and inline cards are flat, cards raised, dashboard panels panel, insets well. */
export const Materials: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
      <Surface material="flat" padding="default">
        Flat: tables, code frames, inline cards
      </Surface>
      <Surface material="raised" padding="default">
        Raised: cards, interactive tiles
      </Surface>
      <Surface material="panel" padding="comfortable">
        Panel: dashboard and landing panels
      </Surface>
      <Surface material="well" padding="default">
        Well: code wells, inner insets
      </Surface>
    </div>
  ),
};

/** Nest concentrically, one shadow per stack: a panel holds a flat card and a well, never another raised surface. */
export const Nested: Story = {
  render: () => (
    <Surface as="section" material="panel" padding="compact" aria-label="Usage">
      <Surface material="flat" padding="default">
        A flat card inside a panel
      </Surface>
      <Surface material="well" padding="default" style={{ marginBlockStart: "0.5rem" }}>
        A well inside the same panel
      </Surface>
    </Surface>
  ),
};
