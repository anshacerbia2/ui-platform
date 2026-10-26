import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./Link";

const meta = {
  title: "Atoms/Link",
  component: Link,
  args: { href: "#evidence", children: "verification evidence" },
  render: (args) => (
    <p>
      Every release ships with its <Link {...args} />.
    </p>
  ),
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/** In dense copy, footers and table cells, the link takes the surrounding color; the underline marks it. */
export const Neutral: Story = { args: { variant: "neutral", href: "#changelog", children: "changelog" } };

/** A link that leaves the product carries the external icon after its text. */
export const External: Story = { args: { external: true, href: "https://www.npmjs.com/", children: "npm package" } };
