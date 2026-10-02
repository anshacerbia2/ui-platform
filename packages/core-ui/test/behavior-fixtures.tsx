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
};

export function BehaviorFixtures({ components }: { components: FixtureComponents }): ReactElement {
  const { ButtonBase, AccordionBase, NavigationBase, TableOfContentsBase, SidebarBaseRoot, SidebarBaseToggle } = components;
  const [pressed, setPressed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    </div>
  );
}
