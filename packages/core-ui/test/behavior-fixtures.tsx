// One fixture per behavior-inventory record (TDD primitives P12). The
// components are passed in, so the same fixtures run against source modules
// in unit tests and against the packed entries in the browser matrix.
// This module imports only React.
import { useState, type ComponentType, type ReactElement } from "react";

// Fixtures accept the source modules and the packed entries alike; compound
// parts (Item, Trigger, ...) are read off the root component.
type C = ComponentType<any> & { [part: string]: any };

export type FixtureComponents = {
  ButtonBase: C;
  AccordionBase: C;
  NavigationBase: C;
  TableOfContentsBase: C;
  SidebarBaseRoot: C;
  SidebarBaseToggle: C;
  TextFieldBase: C;
  DialogBase: C;
  TabsBase: C;
  ComboboxBase: C;
  RadioGroupBase: C;
  TooltipBase: C;
};

export function BehaviorFixtures({ components }: { components: FixtureComponents }): ReactElement {
  const { ButtonBase, AccordionBase, NavigationBase, TableOfContentsBase, SidebarBaseRoot, SidebarBaseToggle, TextFieldBase, DialogBase, TabsBase, ComboboxBase, RadioGroupBase, TooltipBase } = components;
  const [pressed, setPressed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <div data-inventory="ButtonBase">
        <ButtonBase pressed={pressed} onClick={() => setPressed((p) => !p)}>Bold</ButtonBase>
        <ButtonBase href="#docs">Docs</ButtonBase>
        <ButtonBase href="#archived" disabled>Archived</ButtonBase>
      </div>
      <div data-inventory="AccordionBase">
        <AccordionBase disabledAnimations>
          <AccordionBase.Item value="leave">
            <AccordionBase.Header>
              <AccordionBase.Trigger>Leave policy</AccordionBase.Trigger>
            </AccordionBase.Header>
            <AccordionBase.Content forceMount>Annual leave accrues monthly.</AccordionBase.Content>
          </AccordionBase.Item>
        </AccordionBase>
      </div>
      <div data-inventory="NavigationBase">
        <NavigationBase aria-label="Inventory navigation">
          <NavigationBase.Group>
            <NavigationBase.Item href="#people" label="People" isActive />
            <NavigationBase.Item label="Payroll">
              <NavigationBase.Group>
                <NavigationBase.Item href="#runs" label="Runs" />
              </NavigationBase.Group>
            </NavigationBase.Item>
          </NavigationBase.Group>
        </NavigationBase>
      </div>
      <div data-inventory="TableOfContentsBase">
        <h2 id="inventory-target">Inventory target</h2>
        <TableOfContentsBase items={[{ id: "inventory-target", title: "Inventory target" }]} aria-label="On this page">
          <TableOfContentsBase.List>
            <TableOfContentsBase.Item>
              <TableOfContentsBase.Link targetId="inventory-target">Inventory target</TableOfContentsBase.Link>
            </TableOfContentsBase.Item>
          </TableOfContentsBase.List>
        </TableOfContentsBase>
      </div>
      <div data-inventory="SidebarBase">
        <SidebarBaseRoot id="inventory-sidebar" isOpen={sidebarOpen} aria-label="Inventory sidebar">
          <SidebarBaseToggle label="Collapse sidebar" controls="inventory-sidebar" isOpen={sidebarOpen} onClick={() => setSidebarOpen((o) => !o)} />
        </SidebarBaseRoot>
      </div>
      <div data-inventory="TextFieldBase">
        <TextFieldBase id="inventory-email" label="Email" type="email" description="We send the payslip here." error="Enter an email address" />
      </div>
      <div data-inventory="DialogBase">
        <button type="button" data-fixture="dialog-trigger" onClick={() => setDialogOpen(true)}>
          Delete run
        </button>
        <DialogBase id="inventory-dialog" open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogBase.Title>Delete the payroll run?</DialogBase.Title>
          <DialogBase.Description>The run and its payslips are removed.</DialogBase.Description>
          <DialogBase.Close>Cancel</DialogBase.Close>
        </DialogBase>
      </div>
      <div data-inventory="ComboboxBase">
        <ComboboxBase
          id="inventory-combobox"
          items={[
            { value: "ts", label: "TypeScript" },
            { value: "js", label: "JavaScript" },
            { value: "py", label: "Python", disabled: true },
            { value: "rs", label: "Rust" },
          ]}
        >
          <ComboboxBase.Input aria-label="Language" />
          <ComboboxBase.Listbox aria-label="Languages" />
          <ComboboxBase.Status>{(count: number) => `${count} options`}</ComboboxBase.Status>
        </ComboboxBase>
      </div>
      <div data-inventory="TabsBase">
        <TabsBase id="inventory-tabs" defaultValue="pay">
          <TabsBase.List aria-label="Employee">
            <TabsBase.Tab value="pay">Pay</TabsBase.Tab>
            <TabsBase.Tab value="leave">Leave</TabsBase.Tab>
            <TabsBase.Tab value="tax">Tax</TabsBase.Tab>
          </TabsBase.List>
          <TabsBase.Panel value="pay">Pay panel</TabsBase.Panel>
          <TabsBase.Panel value="leave">Leave panel</TabsBase.Panel>
          <TabsBase.Panel value="tax">Tax panel</TabsBase.Panel>
        </TabsBase>
        <div dir="rtl">
          <TabsBase id="inventory-tabs-rtl" defaultValue="one">
            <TabsBase.List aria-label="RTL">
              <TabsBase.Tab value="one">One</TabsBase.Tab>
              <TabsBase.Tab value="two">Two</TabsBase.Tab>
            </TabsBase.List>
            <TabsBase.Panel value="one">One panel</TabsBase.Panel>
            <TabsBase.Panel value="two">Two panel</TabsBase.Panel>
          </TabsBase>
        </div>
      </div>
      <div data-inventory="RadioGroupBase">
        <RadioGroupBase aria-label="Theme" name="inventory-theme" defaultValue="light">
          <RadioGroupBase.Item value="light">Light</RadioGroupBase.Item>
          <RadioGroupBase.Item value="dark">Dark</RadioGroupBase.Item>
          <RadioGroupBase.Item value="system">System</RadioGroupBase.Item>
        </RadioGroupBase>
      </div>
      <div data-inventory="TooltipBase">
        <TooltipBase>
          <TooltipBase.Trigger>
            <button type="button" aria-label="Copy link">Copy</button>
          </TooltipBase.Trigger>
          <TooltipBase.Content>Copy link</TooltipBase.Content>
        </TooltipBase>
      </div>
    </div>
  );
}
