import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button";
import { CodeShowcase } from "./CodeShowcase";

const meta = {
  title: "Organisms/CodeShowcase",
  component: CodeShowcase,
  render: (args) => (
    <CodeShowcase {...args}>
      <CodeShowcase.Preview>
        <Button>Preview</Button>
      </CodeShowcase.Preview>
      <CodeShowcase.Nav>
        <CodeShowcase.Trigger>Show code</CodeShowcase.Trigger>
      </CodeShowcase.Nav>
      <CodeShowcase.Content>
        <div className="scnx-code-showcase__code-inner">
          <pre>
            <code>{`<Button>Preview</Button>`}</code>
          </pre>
        </div>
      </CodeShowcase.Content>
    </CodeShowcase>
  ),
} satisfies Meta<typeof CodeShowcase>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
