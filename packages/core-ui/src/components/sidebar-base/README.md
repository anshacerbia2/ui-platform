# SidebarBase

> Stateless, headless sidebar primitives built on top of NavigationBase.

**Package**: `@scnx/core-ui`
**Status**: Stable
**Source**: [SidebarBase.tsx](./SidebarBase.tsx)

---

## Table of Contents

1. [Overview](#1-overview)
2. [When to Use](#2-when-to-use)
3. [Quick Start](#3-quick-start)
4. [Components](#4-components)
   4.1. [Core Components](#41-core-components)
5. [Usage](#5-usage)
   5.1. [Basic Usage](#51-basic-usage)
   5.2. [With Navigation](#52-with-navigation)
6. [API Reference](#6-api-reference)
   6.1. [SidebarBaseRoot](#61-sidebarbaseroot--sidebarbase)
   6.2. [SidebarBaseToggle](#62-sidebarbasetoggle--sidebarbasetoggle)
   6.3. [SidebarBaseHeader](#63-sidebarbaseheader--sidebarbaseheader)
   6.4. [SidebarBaseNav](#64-sidebarbasenav--sidebarbasenav)
   6.5. [SidebarBaseFooter](#65-sidebarbasefooter--sidebarbasefooter)
7. [Advanced](#7-advanced)
   7.1. [Custom Styling](#71-custom-styling)
   7.2. [TypeScript](#72-typescript)
8. [Accessibility (A11y)](#8-accessibility-a11y)
9. [Best Practices](#9-best-practices)
10. [Related](#10-related)
11. [Import Methods](#11-import-methods)

---

## 1. Overview

`SidebarBase` provides the foundational UI primitives for building sidebar navigation. Unlike the Design System implementations, this base component is **stateless** and does not enforce any specific context or state management library.

It directly extends [NavigationBase](../navigation-base/README.md) for its navigation items, ensuring complete API compatibility with the core navigation system.

### Key Features

- **Stateless Architecture**: Controlled entirely via props (`isOpen`)
- **Semantic Structure**: Renders `<aside>` for the root container
- **State Reflection/Styling Hooks**: Exposes `data-state="expanded" | "collapsed"`
- **Navigation Compatibility**: Full access to `NavigationBase` ecosystem

**Minimal Example:**

```tsx
import { SidebarBase } from "@scnx/core-ui/molecules/sidebar-base";

<SidebarBase isOpen={true}>
  <SidebarBase.Header>Header</SidebarBase.Header>
  <SidebarBase.Nav>
    <SidebarBase.Nav.Group>
      <SidebarBase.Nav.Item label="Home" />
    </SidebarBase.Nav.Group>
  </SidebarBase.Nav>
</SidebarBase>;
```

---

## 2. When to Use

### ✅ Use SidebarBase When:

- **Building Custom Sidebars** - You need full control over sidebar styling and behavior
- **Design System Foundation** - Creating reusable sidebar primitives for your design system
- **Accessibility Required** - Need WCAG-compliant sidebar with ARIA attributes
- **Framework Agnostic** - Works with any state management (Redux, Zustand) or routing library
- **Tree Shaking Critical** - Bundle size matters (minimal overhead)
- **Stateless Architecture** - You want to manage `isOpen` state externally (e.g. Redux, Zustand, Context)

### ❌ Don't Use When:

- **Need Pre-styled Sidebar** - Use `@scnx/design-system`'s `Sidebar` if you want built-in state, flyouts, and responsive logic.
- **Top Navigation** - Use `NavbarBase` for horizontal layouts.
- **Simple Static Sidebar** - Plain HTML `<aside>` might be sufficient
- **No React** - This is React-specific (use vanilla JS or Web Components)

---

## 3. Quick Start

**Installation:**

```bash
pnpm add @scnx/core-ui
```

**Basic Sidebar:**

```tsx
import { SidebarBase } from "@scnx/core-ui/components/sidebar-base";
import { useState } from "react";
import { useLocation } from "react-router-dom"; // Example
import { HomeIcon } from "./icons";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <SidebarBase isOpen={isOpen}>
      <SidebarBase.Header>
        {isOpen && <h1>My App</h1>}
        <SidebarBase.Toggle onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "←" : "→"}
        </SidebarBase.Toggle>
      </SidebarBase.Header>

      <SidebarBase.Nav>
        <SidebarBase.Nav.Group>
          <SidebarBase.Nav.Item
            label="Dashboard"
            icon={<HomeIcon />}
            href="/dashboard"
            isActive={location.pathname === "/dashboard"}
          />
        </SidebarBase.Nav.Group>
      </SidebarBase.Nav>

      <SidebarBase.Footer>User Profile</SidebarBase.Footer>
    </SidebarBase>
  );
}
```

---

## 4. Components

### 4.1. Core Components

- `SidebarBaseRoot` / `SidebarBase` - The main `<aside>` container.
- `SidebarBaseToggle` / `SidebarBase.Toggle` - A button primitive for toggling state.
- `SidebarBaseHeader` / `SidebarBase.Header` - Container for branding/logos.
- `SidebarBaseNav` / `SidebarBase.Nav` - **Alias for NavigationBase**.
- `SidebarBaseFooter` / `SidebarBase.Footer` - Container for user profile/bottom actions.

---

## 5. Usage

### 5.1. Basic Usage

`SidebarBase` is completely controlled. It does not maintain its own state.

```tsx
<SidebarBase isOpen={isSidebarOpen}>{/* Content */}</SidebarBase>
```

### 5.2. With Navigation

Since `SidebarBase.Nav` is `NavigationBase`, you can use all features like nesting, icons, and badges.

```tsx
<SidebarBase.Nav>
  <SidebarBase.Nav.Group>
    <SidebarBase.Nav.Item label="Menu 1" href="/menu-1" />
    <SidebarBase.Nav.Item label="Menu 2" badge={3} href="/menu-2" />
  </SidebarBase.Nav.Group>
</SidebarBase.Nav>
```

---

## 6. API Reference

### 6.1. `SidebarBaseRoot` / `SidebarBase`

**Element:** `<aside>`

| Prop     | Type               | Required | Default | Description                                                      |
| -------- | ------------------ | -------- | ------- | ---------------------------------------------------------------- |
| `ref`    | `Ref<HTMLElement>` | No       | -       | React ref                                                        |
| `isOpen` | `boolean`          | No       | `true`  | Determines the `data-state` attribute (`expanded` / `collapsed`) |

> **Extends:** `React.HTMLAttributes<HTMLElement>`

**Generated Attributes:**

| Attribute    | Value                         | Description            |
| ------------ | ----------------------------- | ---------------------- |
| `data-state` | `"expanded"` \| `"collapsed"` | Sidebar collapse state |

<br/>

### 6.2. `SidebarBaseToggle` / `SidebarBase.Toggle`

**Element:** `<button>`

| Prop  | Type                     | Required | Description |
| ----- | ------------------------ | -------- | ----------- |
| `ref` | `Ref<HTMLButtonElement>` | No       | React ref   |

> **Extends:** `React.ButtonHTMLAttributes<HTMLButtonElement>`

**Generated Attributes:**

| Attribute    | Value              | Description         |
| ------------ | ------------------ | ------------------- |
| `aria-label` | `"Toggle sidebar"` | Accessibility label |

<br/>

### 6.3. `SidebarBaseHeader` / `SidebarBase.Header`

**Element:** `<div>`

| Prop  | Type                  | Required | Description |
| ----- | --------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLDivElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLDivElement>`

<br/>

### 6.4. `SidebarBaseNav` / `SidebarBase.Nav`

**Alias:** [`NavigationBase`](../navigation-base/README.md)

Since `SidebarBaseNav` is a direct alias, it supports all `NavigationBase` sub-components:

- `<SidebarBaseNav.Group>`
- `<SidebarBaseNav.Item>`
- `<SidebarBaseNav.Text>`
- `<SidebarBaseNav.Icon>`
- ...and others.

Refer to the [NavigationBase Documentation](../navigation-base/README.md) for full API details on navigation items.

<br/>

### 6.5. `SidebarBaseFooter` / `SidebarBase.Footer`

**Element:** `<div>`

| Prop  | Type                  | Required | Description |
| ----- | --------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLDivElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLDivElement>`

---

## 7. Advanced

### 7.1. Custom Styling

You can style the sidebar based on its open/closed state using the `data-state` attribute.

```css
/* Example CSS */
[data-state="expanded"] {
  width: 250px;
  transition: width 0.3s ease;
}

[data-state="collapsed"] {
  width: 64px;
}
```

---

## 8. Accessibility (A11y)

SidebarBase follows **WCAG 2.1 Level A** guidelines:

- ✅ **1.3.1 Info and Relationships** - Semantic HTML structure (`<aside>`, `<nav>`)
- ✅ **4.1.2 Name, Role, Value** - ARIA attributes for state communication

**Key Features:**

- **Landmark Region** - Renders as `<aside>` to define a complementary landmark for assistive technology
- **Navigation Integration** - Inherits all accessibility features from `NavigationBase` (roled lists, current item state)
- **Reduced Motion** - Compatible with `prefers-reduced-motion` media queries via standard CSS implementations
- **State Reflection/Styling Hooks** - Uses `data-state` to expose expanded/collapsed state for CSS styling and animations

> **Note:** When using a **custom** Toggle button (or if using `SidebarBase.Toggle` with only an icon), ensure you provide an `aria-label` or accessible text content. `SidebarBase.Toggle` provides a default `aria-label="Toggle sidebar"`.

## 9. Best Practices

### 9.1. State Reflection/Styling Hooks

Always ensure `isOpen` prop matches your application state. If using with `NavigationBase` items that have `isActive`, ensure the `SidebarBase` container doesn't hide them unexpectedly (e.g., hiding labels in collapsed state clearly).

---

## 10. Related

- [NavigationBase](../navigation-base/README.md) - Navigation primitives used by SidebarBase
- [NavbarBase](../navbar-base/README.md) - Horizontal navbar component

---

## 11. Import Methods

**Named Exports (Optimal Tree Shaking):**

```tsx
import {
  SidebarBaseRoot,
  SidebarBaseHeader,
  SidebarBaseNav,
} from "@scnx/core-ui/components/sidebar-base";

<SidebarBaseRoot>
  <SidebarBaseHeader>...</SidebarBaseHeader>
  <SidebarBaseNav>...</SidebarBaseNav>
</SidebarBaseRoot>;
```

**Compound Export (Recommended for DX):**

```tsx
import { SidebarBase } from "@scnx/core-ui/components/sidebar-base";

<SidebarBase>
  <SidebarBase.Header>...</SidebarBase.Header>
  <SidebarBase.Nav>...</SidebarBase.Nav>
  <SidebarBase.Footer>...</SidebarBase.Footer>
</SidebarBase>;
```
