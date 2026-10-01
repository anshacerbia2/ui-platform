import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../button";
import { Transition } from "./Transition";

const Demo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="secondary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide details" : "Show details"}
      </Button>
      <Transition open={open} styleFrom={{ height: 0, opacity: 0, overflow: "hidden" }} styleTo={{ height: "auto", opacity: 1 }} style={{ transition: "height 300ms, opacity 300ms" }}>
        <p>Details appear and disappear through the transition state machine.</p>
      </Transition>
    </div>
  );
};

const meta = { title: "Atoms/Transition", component: Demo } satisfies Meta<typeof Demo>;
export default meta;

export const Toggle: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show details" }));
    await waitFor(() => expect(canvasElement.querySelector(".scnx-transition")).toHaveAttribute("data-state", "settled"));
  },
};
