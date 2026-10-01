import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeSelect } from "./CodeSelect";

const OPTIONS = [
  { id: "tsx", title: "TypeScript (TSX)" },
  { id: "jsx", title: "JavaScript (JSX)" },
  { id: "css", title: "CSS" },
];

const Demo = () => {
  const [value, setValue] = useState<string | number>("tsx");
  return <CodeSelect options={OPTIONS} value={value} onChange={setValue} placeholder="Language" />;
};

const meta = { title: "Organisms/CodeSelect", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
