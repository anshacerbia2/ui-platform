# NavigationBase

> Headless navigation primitives for building accessible menus, sidebars, and tree views.

**Package**: `@scnx/core-ui`
**Status**: Stable
**Source**: [NavigationBase.tsx](./NavigationBase.tsx)

---

## Table of Contents

1. [Overview](#1-overview)
2. [When to Use](#2-when-to-use)
3. [Quick Start](#3-quick-start)
4. [Components](#4-components)
   4.1. [Core Components](#41-core-components)
   4.2. [Sub-Components](#42-sub-components)
   4.3. [Context (Internal)](#43-context-internal)
5. [Usage](#5-usage)
   5.1. [Basic Navigation](#51-basic-navigation)
   5.2. [With Icons and Badges](#52-with-icons-and-badges)
   5.3. [Nested Navigation](#53-nested-navigation)
   5.4. [Polymorphic Rendering](#54-polymorphic-rendering)
   5.5. [Common Patterns](#55-common-patterns)
6. [API Reference](#6-api-reference)
   6.1. [NavigationBaseRoot](#61-navigationbaseroot--navigationbaseroot)
   6.2. [NavigationBaseGroup](#62-navigationbasegroup--navigationbasegroup)
   6.3. [NavigationBaseItem](#63-navigationbaseitem--navigationbaseitem)
   6.4. [NavigationBaseIcon](#64-navigationbaseicon--navigationbaseicon)
   6.5. [NavigationBaseItemContent](#65-navigationbaseitemcontent--navigationbaseitemcontent)
   6.6. [NavigationBaseText](#66-navigationbasetext--navigationbasetext)
   6.7. [NavigationBaseBadge](#67-navigationbasebadge--navigationbasebadge)
   6.8. [NavigationBaseTrailingIcon](#68-navigationbasetrailingicon--navigationbasetrailingicon)
7. [Advanced](#7-advanced)
   7.1. [Custom Styling with Data Attributes](#71-custom-styling-with-data-attributes)
   7.2. [TypeScript](#72-typescript)
8. [Internal](#8-internal)
   8.1. [Level Injection System](#81-level-injection-system)
   8.2. [Index Injection System](#82-index-injection-system)
9. [Accessibility (A11y)](#9-accessibility-a11y)
10. [Best Practices](#10-best-practices)
    10.1. [Structure Requirements](#101-structure-requirements)
    10.2. [Level vs Index Behavior](#102-level-vs-index-behavior)
    10.3. [General Guidelines](#103-general-guidelines)
11. [Related](#11-related)
12. [Import Methods](#12-import-methods)

---

## 1. Overview

`NavigationBase` provides unstyled, accessible navigation components with automatic nesting, polymorphic rendering, and ARIA attribute management. Perfect for building custom navigation UIs without styling constraints.

### Key Features

- **Semantic Structure**: Uses proper HTML5 `<nav>`, `<ul>`, and `<li>` elements
- **Accessibility**: Built-in ARIA roles, states (`aria-current`, `aria-expanded`), and keyboard support
- **Nested Navigation**: Automatic depth tracking and level-based styling hooks
- **Polymorphic**: Render as `<a>`, `<button>`, or framework components (`Link`)
- **State Reflection/Styling Hook**: Handling for active states, disabled items, and expansion logic
- **Rich Content**: Supports icons, badges, trailing indicators, and custom content slots
- **Headless**: Complete styling freedom via CSS variables and data attributes

**Minimal Example:**

```tsx
import { NavigationBase } from "@scnx/core-ui/components/navigation-base";

<NavigationBase>
  <NavigationBase.Group>
    <NavigationBase.Item label="Dashboard" />
    <NavigationBase.Item label="Settings" />
  </NavigationBase.Group>
</NavigationBase>;
```

---

## 2. When to Use

### ✅ Use NavigationBase When:

- **Building Custom Navigation** - You need full control over styling and behavior
- **Design System Foundation** - Creating reusable navigation primitives for your design system
- **Accessibility Required** - Need WCAG-compliant navigation with ARIA attributes
- **Framework Agnostic** - Works with React Router, Next.js, Remix, or any routing library
- **Tree Shaking Critical** - Bundle size matters (67% smaller than alternatives)
- **Nested Navigation** - Building hierarchical menus, sidebars, or tree views
- **Stateless Architecture** - You want to manage states (`isActive`, `isExpanded`, etc.) externally (e.g. Redux, Zustand, Context)

### ❌ Don't Use When:

- **Need Pre-styled Components** - Use `@scnx/design-system` components, or UI libraries like Material-UI, Chakra UI
- **Simple Static Nav** - Plain HTML `<nav>` might be sufficient
- **No React** - This is React-specific (use vanilla JS or Web Components)

---

## 3. Quick Start

**Installation:**

```bash
pnpm add @scnx/core-ui
```

**Basic Navigation:**

```tsx
import { NavigationBase } from "@scnx/core-ui/components/navigation-base";
import { useLocation } from "react-router-dom";
import { HomeIcon, SettingsIcon } from "./icons";

export function MyNav() {
  const location = useLocation();

  return (
    <NavigationBase>
      <NavigationBase.Group>
        <NavigationBase.Item
          as="a"
          href="/dashboard"
          label="Dashboard"
          icon={<HomeIcon />}
          isActive={location.pathname === "/dashboard"}
        />
        <NavigationBase.Item
          as="a"
          href="/settings"
          label="Settings"
          icon={<SettingsIcon />}
          isActive={location.pathname === "/settings"}
        />
      </NavigationBase.Group>
    </NavigationBase>
  );
}
```

**HTML Output:**

```html
<nav>
  <ul role="list">
    <li
      role="listitem"
      data-index="0"
      data-level="0"
      style="--item-index: 0; --root-item-index: 0"
    >
      <a
        data-active="true"
        data-disabled="false"
        aria-current="page"
        aria-disabled="false"
        href="/dashboard"
      >
        <span data-slot="icon" aria-hidden="true">
          <!-- HomeIcon -->
        </span>
        <span data-slot="item-content">
          <span data-slot="text">Dashboard</span>
        </span>
      </a>
    </li>
    <li
      role="listitem"
      data-index="1"
      data-level="0"
      style="--item-index: 1; --root-item-index: 1"
    >
      <a
        data-active="false"
        data-disabled="false"
        aria-disabled="false"
        href="/settings"
      >
        <span data-slot="icon" aria-hidden="true">
          <!-- SettingsIcon -->
        </span>
        <span data-slot="item-content">
          <span data-slot="text">Settings</span>
        </span>
      </a>
    </li>
  </ul>
</nav>
```

---

## 4. Components

### 4.1. Core Components

- `NavigationBaseRoot` / `NavigationBase` - `<nav>` wrapper for semantic navigation structure
- `NavigationBaseGroup` / `NavigationBase.Group` - `<ul>` list container with automatic indexing
- `NavigationBaseItem` / `NavigationBase.Item` - `<li>` navigation item with polymorphic rendering

### 4.2. Sub-Components (Internal)

Auto-rendered via props or manual composition:

- `NavigationBaseIcon` / `NavigationBase.Icon` - Leading icon wrapper
- `NavigationBaseText` / `NavigationBase.Text` - Text label wrapper
- `NavigationBaseBadge` / `NavigationBase.Badge` - Badge/notification indicator
- `NavigationBaseTrailingIcon` / `NavigationBase.TrailingIcon` - Trailing icon (chevrons, arrows)
- `NavigationBaseItemContent` / `NavigationBase.ItemContent` - Groups Text, Badge, and TrailingIcon

### 4.3. Context (Internal)

- `NavigationLevelContext` - Tracks nesting depth for recursive navigation trees
- `useNavigationLevel()` - Hook to access current nesting level

---

## 5. Usage

### 5.1. Basic Navigation

```tsx
<NavigationBase>
  <NavigationBase.Group>
    <NavigationBase.Item label="Home" href="/" />
    <NavigationBase.Item label="About" href="/about" />
    <NavigationBase.Item label="Contact" href="/contact" />
  </NavigationBase.Group>
</NavigationBase>
```

### 5.2. With Icons and Badges

```tsx
<NavigationBase.Item
  label="Messages"
  icon={<MessageIcon />}
  badge={5}
  trailingIcon={<ChevronIcon />}
  href="/messages"
/>
```

### 5.3. Nested Navigation

```tsx
<NavigationBase>
  <NavigationBase.Group>
    <NavigationBase.Item as="div" label="Projects" isExpanded={true}>
      <NavigationBase.Group>
        <NavigationBase.Item label="Project A" href="/project-a" />
        <NavigationBase.Item label="Project B" href="/project-b" />
      </NavigationBase.Group>
    </NavigationBase.Item>
  </NavigationBase.Group>
</NavigationBase>
```

### 5.4. Polymorphic Rendering

**React Router:**

```tsx
import { Link } from "react-router-dom";

<NavigationBase.Item as={Link} label="Dashboard" to="/dashboard" />;
```

**Next.js:**

```tsx
import Link from "next/link";

<NavigationBase.Item as={Link} label="Dashboard" href="/dashboard" />;
```

**Button:**

```tsx
<NavigationBase.Item as="button" label="Toggle Menu" onClick={handleClick} />
```

### 5.5. Common Patterns

NavigationBase can be used to build various navigation patterns:

- **Sidebar Navigation** - Vertical navigation with nested menus and icons
- **Horizontal Navbar** - Top navigation bar with flex layout
- **Breadcrumbs** - Hierarchical page location indicator
- **Dropdown Menu** - Contextual menus (user account, settings)
- **Tree View** - File explorer or hierarchical data navigation
- **Accordion Menu** - Collapsible sections with expand/collapse
- **Tab Navigation** - Horizontal tabs for content switching
- **Mega Menu** - Multi-column dropdown with rich content

> **Tip:** Use `data-level` for indentation, `isExpanded` for collapsible sections, and `isActive` for highlighting current location.

---

## 6. API Reference

### 6.1. `NavigationBaseRoot` / `NavigationBase`

**Element:** `<nav>`

| Prop  | Type               | Required | Description |
| ----- | ------------------ | -------- | ----------- |
| `ref` | `Ref<HTMLElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLElement>`

<br/>

### 6.2. `NavigationBaseGroup` / `NavigationBase.Group`

**Element:** `<ul>`

| Prop       | Type                                                                               | Required | Description      |
| ---------- | ---------------------------------------------------------------------------------- | -------- | ---------------- |
| `ref`      | `Ref<HTMLUListElement>`                                                            | No       | React ref        |
| `children` | `ReactElement<NavigationBaseItemProps> \| ReactElement<NavigationBaseItemProps>[]` | No       | Navigation items |

> **Extends:** `React.HTMLAttributes<HTMLUListElement>`

**Generated Attributes:**

| Attribute | Value    | Element | Description                                      |
| --------- | -------- | ------- | ------------------------------------------------ |
| `role`    | `"list"` | `<ul>`  | Semantic role for accessibility (screen readers) |

> **Note:** Also injects `data-index` and `--item-index` CSS variable to child `NavigationBaseItem` components.

<br/>

### 6.3. `NavigationBaseItem` / `NavigationBase.Item`

**Element:** `<li>` (polymorphic)

| Prop                    | Type                      | Required | Description                                               |
| ----------------------- | ------------------------- | -------- | --------------------------------------------------------- |
| `ref`                   | `Ref<HTMLElement>`        | No       | React ref                                                 |
| `as`                    | `ElementType`             | No       | Component to render (default: `"a"`)                      |
| `className`             | `string`                  | No       | CSS class for polymorphic element                         |
| `iconClassName`         | `string`                  | No       | CSS class for icon wrapper                                |
| `itemContentClassName`  | `string`                  | No       | CSS class for ItemContent wrapper                         |
| `textClassName`         | `string`                  | No       | CSS class for text wrapper                                |
| `badgeClassName`        | `string`                  | No       | CSS class for badge wrapper                               |
| `trailingIconClassName` | `string`                  | No       | CSS class for trailing icon wrapper                       |
| `style`                 | `CSSProperties`           | No       | Inline styles for `<li>` element                          |
| `label`                 | `string`                  | **Yes**  | Text label                                                |
| `icon`                  | `ReactNode`               | No       | Leading icon                                              |
| `badge`                 | `ReactNode`               | No       | Notification badge                                        |
| `trailingIcon`          | `ReactNode`               | No       | Trailing icon (chevron, arrow, etc.)                      |
| `children`              | `ReactNode`               | No       | Nested `NavigationBase.Group` for hierarchical navigation |
| `onClick`               | `(e: MouseEvent) => void` | No       | Click handler                                             |
| `isActive`              | `boolean`                 | No       | Sets `aria-current="page"` and `data-active="true"`       |
| `isExpanded`            | `boolean`                 | No       | Sets `aria-expanded` and `data-expanded`                  |
| `isDisabled`            | `boolean`                 | No       | Sets `aria-disabled` and `data-disabled`                  |

> **Note:** Allows arbitrary props via `[key: string]: any` for polymorphic component compatibility (e.g., `to` for React Router `Link`, `href` for Next.js `Link`).

**Generated Attributes:**

On `<li>` element:

| Attribute    | Value        | Description                                     |
| ------------ | ------------ | ----------------------------------------------- |
| `role`       | `"listitem"` | Semantic role for accessibility                 |
| `data-index` | `number`     | Item index within group (injected by Group)     |
| `data-level` | `number`     | Nesting depth (0 = root, 1 = first child, etc.) |

On polymorphic element (e.g., `<a>`, `<button>`, `Link`):

| Attribute       | Value                 | Condition                                     | Description                            |
| --------------- | --------------------- | --------------------------------------------- | -------------------------------------- |
| `data-active`   | `"true"`              | When `isActive={true}`                        | Indicates current/active page or route |
| `data-expanded` | `"true"` \| `"false"` | When `children` exist and `isExpanded={true}` | Collapsible state (open/closed)        |
| `data-disabled` | `"true"`              | When `isDisabled={true}`                      | Disabled/non-interactive state         |
| `aria-current`  | `"page"`              | When `isActive={true}`                        | ARIA: Current page indicator           |
| `aria-expanded` | `"true"` \| `"false"` | When `children` exist and `isExpanded={true}` | ARIA: Collapsible state                |
| `aria-disabled` | `"true"`              | When `isDisabled={true}`                      | ARIA: Disabled state                   |

**Generated CSS Variables:**

| Property              | Type     | Description                                    | Element                                        |
| --------------------- | -------- | ---------------------------------------------- | ---------------------------------------------- |
| `--item-index`        | `number` | Current item index (0-based)                   | `li`                                           |
| `--root-item-index`   | `number` | Root-level item index (only for level 0 items) | `li`                                           |
| `--parent-item-index` | `number` | Parent item index (for nested items)           | `div` (Nested wrapper: `li > div:first-child`) |

<br/>

### 6.4. `NavigationBaseIcon` / `NavigationBase.Icon`

**Element:** `<span>`

| Prop  | Type                   | Required | Description |
| ----- | ---------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLSpanElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLSpanElement>`

<br/>

### 6.5. `NavigationBaseItemContent` / `NavigationBase.ItemContent`

**Element:** `<span>`

| Prop  | Type                   | Required | Description |
| ----- | ---------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLSpanElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLSpanElement>`

<br/>

### 6.6. `NavigationBaseText` / `NavigationBase.Text`

**Element:** `<span>`

| Prop  | Type                   | Required | Description |
| ----- | ---------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLSpanElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLSpanElement>`

<br/>

### 6.7. `NavigationBaseBadge` / `NavigationBase.Badge`

**Element:** `<span>`

| Prop  | Type                   | Required | Description |
| ----- | ---------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLSpanElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLSpanElement>`

<br/>

### 6.8. `NavigationBaseTrailingIcon` / `NavigationBase.TrailingIcon`

**Element:** `<span>`

| Prop  | Type                   | Required | Description |
| ----- | ---------------------- | -------- | ----------- |
| `ref` | `Ref<HTMLSpanElement>` | No       | React ref   |

> **Extends:** `React.HTMLAttributes<HTMLSpanElement>`

---

## 7. Advanced

### 7.1. Custom Styling with Data Attributes

**Example 1: Styling with Data Attributes**

```css
/* Active state */
[data-active="true"] {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

/* Indentation based on nesting level */
[data-level="0"] {
  padding-left: 0;
}
[data-level="1"] {
  padding-left: 1.5rem;
}
[data-level="2"] {
  padding-left: 3rem;
}

/* Expanded state */
[data-expanded="true"] {
  height: auto;
}

/* Disabled state */
[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Example 2: Styling with Generated CSS Variables**

```css
/* Staggered fade-in animation */
[data-index] {
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
  animation-delay: calc(var(--item-index) * 50ms);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dynamic background based on parent index */
[data-level="1"] {
  background: hsl(calc(var(--parent-item-index) * 30), 70%, 95%);
}

/* Root item highlighting */
[data-level="0"] {
  border-left: 3px solid hsl(calc(var(--root-item-index) * 60), 80%, 60%);
}
```

### 7.2. TypeScript

```tsx
import type { NavigationBaseItemProps } from "@scnx/core-ui/components/navigation-base";

const items: NavigationBaseItemProps[] = [
  { label: "Home", icon: <HomeIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
];
```

---

## 8. Internal

> **Note:** This section documents internal implementation details. You typically don't need to use these directly unless building custom navigation components.

### 8.1. Level Injection System

| Property    | Value                    |
| ----------- | ------------------------ |
| **Context** | `NavigationLevelContext` |
| **Hook**    | `useNavigationLevel()`   |
| **Type**    | `React.Context<number>`  |
| **Default** | `0` (root level)         |

**Purpose:** Tracks nesting depth for automatic `data-level` attribute generation and CSS variable scoping.

**How It Works:**

1. `NavigationBaseGroup` reads current level via `useNavigationLevel()` to determine if it should initialize `--root-item-index` CSS variable (only when `level === 0`). This CSS var is injected to its children which is `NavigationBaseItem (<li>)`.

2. `NavigationBaseItem` reads the context level from the nearest ancestor `NavigationBaseItem` that provides the context (if there is no ancestor providing context, it returns `0`), then:
   - Sets `data-level={currentLevel}` on the `<li>` element
   - If it has children, creates a new context with `currentLevel + 1` that will be used by nested NavigationBaseItem

3. Nested `NavigationBaseItem` reads the incremented level from the context provided by its nearest ancestor Item.

**Source Code Flow:**

```tsx
// Group reads current level for CSS var scoping
function Group({ children }: NavigationBaseGroupProps) {
  const currentLevel = useNavigationLevel(); // Read from parent context

  return (
    <ul ref={ref} className={className} role="list" {...rest}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<NavigationBaseItemProps>(child)) {
          return React.cloneElement(child, {
            "data-index": index,
            style: {
              ...(child.props.style || {}),
              "--item-index": index,
              // Initialize root-item-index CSS var ONLY at level 0
              // (Used for root items stagger animations in sidebar)
              ...(currentLevel === 0 ? { "--root-item-index": index } : {}),
              // Initialize level-1-item-index CSS var ONLY at level 1
              // (Used for nested items with data-level >= 1 stagger animations in descendants)
              ...(currentLevel === 1 ? { "--level-1-item-index": index } : {}),
            } as React.CSSProperties,
          });
        }
        return child;
      })}
    </ul>
  );
}

// Item reads context level, sets data-level, creates new context for children
function Item({ children }: NavigationBaseItemProps) {
  const currentLevel = useNavigationLevel(); // Read from parent Group's context

  return (
    <li data-level={currentLevel}>
      {/* Use current level */}
      <a>Label</a>
      {children && (
        // Create NEW context with incremented level for nested children
        <NavigationLevelContext value={currentLevel + 1}>
          {children} {/* Nested Group will read level = currentLevel + 1 */}
        </NavigationLevelContext>
      )}
    </li>
  );
}
```

**Example Flow:**

```tsx
// Default context = 0
<NavigationBase.Group>
  {/* reads level = 0, sets --root-item-index */}
  <NavigationBase.Item>
    {/* reads level = 0, sets data-level="0" */}
    <NavigationBase.Group>
      {/* reads level = 1 (from parent Item context) */}
      <NavigationBase.Item>
        {/* reads level = 1, sets data-level="1" */}
        <NavigationBase.Group>
          {/* reads level = 2 (from parent Item context) */}
          <NavigationBase.Item /> {/* reads level = 2, sets data-level="2" */}
        </NavigationBase.Group>
      </NavigationBase.Item>
    </NavigationBase.Group>
  </NavigationBase.Item>
</NavigationBase.Group>
```

### 8.2. Index Injection System

**Purpose:** Automatic injection of index-based attributes and CSS variables from `NavigationBaseGroup` to `NavigationBaseItem` children for styling and animations.

**What Gets Injected:**

| Attribute/Variable    | Type     | Injected To                           | Condition                   | Purpose                              |
| --------------------- | -------- | ------------------------------------- | --------------------------- | ------------------------------------ |
| `data-index`          | `number` | `li` element                          | Always                      | Item position within group (0-based) |
| `--item-index`        | CSS var  | `li` element                          | Always                      | Item index for CSS calculations      |
| `--root-item-index`   | CSS var  | `li` element                          | Only when `level === 0`     | Root-level item index                |
| `--parent-item-index` | CSS var  | Nested wrapper `li > div:first-child` | Only when Item has children | Parent item index for nested items   |

**How It Works:**

1. `NavigationBaseGroup` uses `React.Children.map` to iterate over its children
2. For each child that is a valid `NavigationBaseItem`, it clones the element with injected props
3. Injected props include `data-index` and merged `style` object with CSS variables
4. `NavigationBaseItem` receives these props and applies them to the `<li>` element

**Source Code Flow:**

```tsx
// Group injects index to Item children
function Group({ children }: NavigationBaseGroupProps) {
  const currentLevel = useNavigationLevel();

  return (
    <ul role="list">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<NavigationBaseItemProps>(child)) {
          return React.cloneElement(child, {
            "data-index": index, // Inject data-index
            style: {
              ...(child.props.style || {}), // Preserve existing styles
              "--item-index": index, // Inject --item-index
              // Conditionally inject --root-item-index
              ...(currentLevel === 0 ? { "--root-item-index": index } : {}),
            } as React.CSSProperties,
          });
        }
        return child;
      })}
    </ul>
  );
}

// Item receives and applies injected props
function Item({ style, ...rest }: NavigationBaseItemProps) {
  const { "data-index": dataIndex, ...componentRest } = rest as any;

  return (
    <li
      role="listitem"
      style={style} // CSS vars applied here
      data-index={dataIndex} // data-index applied here
    >
      <a>{/* ... */}</a>
      {children && (
        <div style={{ display: "contents", "--parent-item-index": dataIndex }}>
          {children} {/* --parent-item-index available to nested items */}
        </div>
      )}
    </li>
  );
}
```

**Example Output:**

```tsx
<NavigationBase.Group>
  <NavigationBase.Item label="Item 1" />
  <NavigationBase.Item label="Item 2" />
</NavigationBase.Group>

// Renders:
<ul role="list">
  <li
    role="listitem"
    data-index="0"
    style="--item-index: 0; --root-item-index: 0;"
  >
    <a>Item 1</a>
  </li>
  <li
    role="listitem"
    data-index="1"
    style="--item-index: 1; --root-item-index: 1;"
  >
    <a>Item 2</a>
  </li>
</ul>
```

**Nested Items Example:**

```tsx
<NavigationBase.Group>
  {/* level = 0 */}
  <NavigationBase.Item label="Parent">
    {/* data-index="0", --root-item-index: 0 */}
    <NavigationBase.Group>
      {/* level = 1 */}
      <NavigationBase.Item label="Child" />
      {/* data-index="0", --parent-item-index: 0 */}
    </NavigationBase.Group>
  </NavigationBase.Item>
</NavigationBase.Group>

// Child item has access to:
// - data-index="0" (its own index in nested group)
// - --item-index: 0 (its own index)
// - --parent-item-index: 0 (parent's index from wrapper div)
// - NO --root-item-index (level > 0)
```

**Usage in Styling:**

```css
/* Staggered animation using --item-index */
[data-index] {
  animation-delay: calc(var(--item-index) * 50ms);
}

/* Root-level specific styling */
[data-level="0"] {
  border-left: 3px solid hsl(calc(var(--root-item-index) * 60), 80%, 60%);
}

/* Nested items styled based on parent index */
[data-level="1"] {
  background: hsl(calc(var(--parent-item-index) * 30), 70%, 95%);
}
```

---

## 9. Accessibility (A11y)

NavigationBase follows **WCAG 2.1 Level A** guidelines:

- ✅ **1.3.1 Info and Relationships** - Semantic HTML structure (`<nav>`, `<ul>`, `<li>`)
- ✅ **4.1.2 Name, Role, Value** - ARIA attributes for state communication

**Key Features:**

- **Screen Reader Support** - `role="list"` and `role="listitem"` for proper announcement
- **Keyboard Navigation** - Tab (focus), Enter/Space (activate)
- **State Communication** - `aria-current`, `aria-expanded`, `aria-disabled`
- **State Reflection/Styling Hooks** - Data attributes (`data-active`, `data-disabled`, `data-expanded`) for consumer styling

> **Note:** Arrow key navigation is **consumer implementation** (not provided by default).

**For detailed attribute reference**, see [API Reference - NavigationBaseItem](#63-navigationbaseitem--navigationbaseitem).

---

## 10. Best Practices

### 10.1. Structure Requirements

**CRITICAL: Items MUST be wrapped in Groups**

```tsx
// ✅ CORRECT
<NavigationBase>
  <NavigationBase.Group>
    <NavigationBase.Item label="Home" />
  </NavigationBase.Group>
</NavigationBase>

// ❌ WRONG - Missing Group wrapper
<NavigationBase>
  <NavigationBase.Item label="Home" />
</NavigationBase>
```

**Why Group is Required:**

1. **Semantic HTML** - Group renders `<ul>`, Item renders `<li>` (invalid HTML without `<ul>` parent)
2. **Data Injection** - Group injects `data-index` and `--item-index` CSS variable to children
3. **Accessibility** - Group provides `role="list"` for screen readers
4. **Styling Hooks** - Without Group, Items lack index-based styling capabilities

**Impacts of Missing Group:**

- ❌ Invalid HTML (`<li>` without `<ul>`)
- ❌ Missing `data-index` attribute (breaks index-based styling)
- ❌ Missing `--item-index` CSS variable (breaks staggered animations)
- ❌ No `role="list"` (accessibility failure, WCAG violations)

### 10.2. Level vs Index Behavior

**Level (Context-based):**

- Generated via `NavigationLevelContext`
- **Order-independent** - doesn't matter if Group or Item comes first
- Incremented by Item when wrapping nested Group
- Used for `data-level` attribute

```tsx
<NavigationBase.Group>
  {/* level = 0 (from context default) */}
  <NavigationBase.Item>
    {/* level = 0 */}
    <NavigationBase.Group>
      {/* level = 1 (Item incremented context) */}
      <NavigationBase.Item /> {/* level = 1 */}
    </NavigationBase.Group>
  </NavigationBase.Item>
</NavigationBase.Group>
```

**Index (Parent-based):**

- Injected by **direct parent Group only**
- **Order-dependent** - based on position in Group's children array
- Used for `data-index` attribute and `--item-index` CSS variable
- **Items outside Group don't get index**

```tsx
<NavigationBase.Group>
  <NavigationBase.Item />  {/* data-index="0", --item-index: 0 */}
  <NavigationBase.Item />  {/* data-index="1", --item-index: 1 */}
</NavigationBase.Group>

<NavigationBase.Item />  {/* ❌ No data-index, no --item-index (no parent Group) */}
```

### 10.3. General Guidelines

✅ **Do:**

- Always wrap Items in Groups (required structure)
- Use `as` prop for polymorphic rendering (React Router, Next.js)
- Leverage `data-index` and `data-level` for styling
- Use `isActive` for current page indication
- Nest `NavigationBase.Group` inside `NavigationBase.Item` for hierarchies

❌ **Don't:**

- Don't render Items without Group wrapper (invalid HTML + missing functionality)
- Don't apply styles directly to components (use `className` props)
- Don't forget to set `isActive` for current route
- Don't rely on index for Items outside Groups (won't exist)

---

## 11. Related

- [SidebarBase](../../../organisms/sidebar-base/README.md) - Full sidebar implementation using NavigationBase
- [NavbarBase](../../../organisms/navbar-base/README.md) - Horizontal navbar using NavigationBase
- [Core UI Package](../../../README.md) - Package documentation

---

## 12. Import Methods

**Named Exports (Optimal Tree Shaking):**

```tsx
import {
  NavigationBaseGroup,
  NavigationBaseItem,
  NavigationBaseRoot,
} from "@scnx/core-ui/components/navigation-base";
```

**Compound Export (Recommended for DX):**

```tsx
import { NavigationBase } from "@scnx/core-ui/components/navigation-base";
```
