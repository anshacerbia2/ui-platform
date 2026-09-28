# Contributing to @scnx/core-ui

This guide details the development workflow, including testing, linting, and formatting practices.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Formatting](#2-formatting)
3. [Linting](#3-linting)
4. [Build System (Development Workflow)](#4-build-system-development-workflow)
5. [Project Structure](#5-project-structure)
6. [Testing](#6-testing)

---

## 1. Prerequisites

- **Node.js**: v18+
- **Package Manager**: pnpm (v9+)
- **Editor**: VSCode (recommended)

---

## 2. Formatting

We use [Prettier](https://prettier.io/) for code formatting to ensure consistent style across the codebase.

### 2.1. Key Commands

| Command | Description |
| :--- | :--- |
| `pnpm format` | Auto-format all files |
| `pnpm format:check` | Check if files are formatted (CI) |

### 2.2. Configuration (`.prettierrc`)

| Property | Value | Description |
| :--- | :--- | :--- |
| `semi` | `true` | Add semicolons at the end of statements |
| `singleQuote` | `false` | Use double quotes instead of single quotes |
| `tabWidth` | `2` | Number of spaces per indentation level |
| `trailingComma` | `"es5"` | Print trailing commas where valid in ES5 (objects, arrays, etc.) |
| `printWidth` | `80` | Wrap lines when they exceed 80 characters |
| `arrowParens` | `"always"` | Always include parentheses around arrow function arguments |

### 2.3. Auto-Formatting (VSCode)

1.  Install **Prettier - Code formatter** extension (required to integrate the local `prettier` package with VSCode).
2.  Settings are mostly configured in `.vscode/settings.json`.
3.  Files are automatically formatted on save.

---

## 3. Linting

We use [ESLint](https://eslint.org/) with [@antfu/eslint-config](https://github.com/antfu/eslint-config) for strict and modern linting rules.

### 3.1. Tech Stack

| Library | Purpose |
| :--- | :--- |
| **[ESLint](https://eslint.org/)** | Core linting engine to identify and report on patterns in JavaScript/TypeScript |
| **[@antfu/eslint-config](https://github.com/antfu/eslint-config)** | Opinionated, battery-included preset (React, TypeScript, etc.) |
| **[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)** | Enforces Rules of Hooks (included in preset) |

### 3.2. Configuration (`eslint.config.js`)

We use a flat config approach with the following overrides:

- **Presets Enabled**: `react: true`, `typescript: true`
- **Formatters Disabled**: `formatters: false` (delegated to Prettier)

### 3.3. Custom Rules

| Rule | Value | Description |
| :--- | :--- | :--- |
| `no-console` | `warn` | Warns when `console.log` is used. Use a proper logger in production to avoid cluttering the browser console. |
| `prefer-const` | `error` | Enforces the use of `const` for variables that are never simultaneously reassigned. |
| `@typescript-eslint/no-unused-vars` | `warn` | Warns about declared variables that are never used to keep code clean. |
| `@typescript-eslint/no-explicit-any` | `off` | **Disabled**. Allows usage of `any`. Useful for complex generics or legacy code where types are hard to define. |
| `react/prop-types` | `off` | **Disabled**. We use TypeScript for prop validation, so runtime `propTypes` checks are unnecessary. |
| `react/react-in-jsx-scope` | `off` | **Disabled**. Modern React (v17+) does not require `import React` to use JSX. |

### 3.4. Key Commands

| Command | Description |
| :--- | :--- |
| `pnpm lint` | Check for linting errors |
| `pnpm lint:fix` | Auto-fix linting errors |

---

## 4. Build System (Development Workflow)

We use [tsup](https://tsup.egoist.dev/) for bundling.

### 4.1. Tech Stack

| Library | Purpose |
| :--- | :--- |
| **[tsup](https://tsup.egoist.dev/)** | Simple and fast bundler powered by esbuild. We use it to generate ESM/CJS outputs and type definitions. |

### 4.2. Configuration (`tsup.config.ts`)

| Option | Value | Purpose |
| :--- | :--- | :--- |
| `entry` | `Object` | Granular entry points (no barrel exports) for 100% tree-shaking efficiency. |
| `format` | `['esm', 'cjs']` | **Dual Format**: Modern ESM (`.js`) for bundlers + CJS (`.cjs`) for legacy Node. |
| `dts` | `true` | Generates TypeScript declaration files (`.d.ts`) for IntelliSense. |
| `sourcemap` | `true` | Enables debugging of the built library. |
| `clean` | `true` | Clears the `dist/` directory before every build. |
| `external` | `['react', 'react-dom', 'react-router-dom']` | Peer dependencies are excluded from the bundle (consumers provide them). |
| `splitting` | `false` | Code splitting is disabled to let the consumer application handle chunking. |
| `treeshake` | `{ preset: 'smallest' }` | Aggressive tree-shaking optimization. |
| `minify` | `false` | Disable minification (consumers should minify their own app bundles). |
| `target` | `'es2020'` | Target modern browsers (95%+ coverage) |
| `platform` | `'neutral'` | Compatible with both Browser and Node.js environments. |
| `onSuccess` | `Function` | Restores `"use client"` directives for RSC compatibility. |

### 4.3. Key Commands

| Command | Description |
| :--- | :--- |
| `pnpm build` | Build the library for production (outputs to `dist/`). |

---

## 5. TypeScript Configuration

We use a strict TypeScript configuration extended from the monorepo root.

### 5.1. Configuration (`tsconfig.json`)

| Option | Value | Purpose |
| :--- | :--- | :--- |
| `extends` | `../../tsconfig.json` | Inherits base settings (strict mode, storage rules) from monorepo root. |
| `compilerOptions.jsx` | `react-jsx` | Standard React JSX transformation (no need to import React). |
| `compilerOptions.baseUrl` | `.` | Sets the base directory for non-relative module names. |
| `compilerOptions.module` | `ESNext` | Use the latest ECMAScript standard for modules. |
| `compilerOptions.moduleResolution` | `bundler` | Modern resolution strategy compatible with Vite/tsup (Root uses `Node`). |
| `compilerOptions.paths` | `@test/*` | **Usage:** Testing ONLY. Maps to `./test/*`.<br>**Note:** Do NOT use aliases for source code imports to avoid consumer conflicts. |
| `compilerOptions.types` | `vitest/globals`, `@testing-library/jest-dom` | **1. `vitest/globals`**: Enables global functions (`describe`, `it`, `expect`) so you don't have to import them in every test file.<br>**2. `@testing-library/jest-dom`**: Extends `expect` with DOM-specific matchers like `.toBeInTheDocument()` and `.toHaveClass()`. |
| `compilerOptions.declaration` | `true` | Generate `.d.ts` type definition files. |
| `compilerOptions.declarationMap` | `true` | Generate source maps for `.d.ts` files (for "Go to Definition"). |
| `compilerOptions.outDir` | `dist` | Output directory for the compilation artifacts. |
| `compilerOptions.allowSyntheticDefaultImports` | `true` | Allow default imports from modules with no default export. |
| `compilerOptions.esModuleInterop` | `true` | Enables emit interoperability between CommonJS and ES Modules. |
| `include` | `src/**/*.ts`, `src/**/*.tsx`, `test/**/*.ts`, `test/**/*.tsx`, `vitest.config.ts` | Files to specifically include in the compilation context. We explicitly list both `.ts` and `.tsx` for source and test files, plus the config itself. |
| `exclude` | `node_modules`, `dist` | Files to exclude from compilation. |


---

## 6. Deep Dive: Path Aliases & Module Resolution

Understanding how path aliases (`@/`) work is precise for maintaining a robust library. Here is the breakdown of the flow:

### 6.1. The Three Layers of Resolution

| Layer | Config File | Role | Who uses it? |
| :--- | :--- | :--- | :--- |
| **1. Type Checking** | `tsconfig.json` | Tells TypeScript *where* to find types for `@/`. Purely for VSCode Intellisense and `tsc`. | **IDE, Type Checker** |
| **2. Testing** | `vitest.config.ts` | Tells Vite (Vitest) how to resolve imports at *runtime* during tests. | **Vitest Runner** |
| **3. Build / Dist** | `tsup.config.ts` | Controls what gets output to `dist/`. **Does NOT** automatically rewrite aliases in output code! | **Bundler (tsup)** |

### 6.2. The "Consumer Problem" (Why we use Relative Paths in Source)

When you build the library, the code in `src/` is transformed into `dist/`.

**Scenario A: Using Aliases in Source (BAD)**
```typescript
// src/organisms/Sidebar.tsx
import { Button } from '@/atoms/Button';
```
**Output (`dist/index.js`):**
```javascript
import { Button } from '@/atoms/Button'; // Preserves alias!
```
**Result:** When a user installs your library and runs *their* app (Next.js/Vite), their bundler sees `@/` and thinks it refers to **THEIR** project root, not your library. **CRASH!**

**Scenario B: Using Relative Paths (GOOD)**
```typescript
// src/organisms/Sidebar.tsx
import { Button } from '../../atoms/Button';
```
**Output (`dist/index.js`):**
```javascript
import { Button } from '../../atoms/Button'; // Relative path works everywhere
```
**Result:** The import is explicitly resolved relative to the file. It works in any project, regardless of the consumer's config.

### 6.3. The Flow Diagram

```mermaid
flowchart TD
    A[Codebase] -->|IDE / VSCode| B{tsconfig.json}
    B -->|Has paths?| B1[Yes: Intellisense Works]
    B -->|No paths?| B2[Red Squiggles]

    A -->|pnpm test| C{vitest.config.ts}
    C -->|Has alias?| C1[Resolves local files (Runtime)]
    C -->|No alias?| C2[Module Not Found Error]

    A -->|pnpm build (tsup)| D{Output Strategy}
    D -->|Relative Imports| E[Safe: Works in Consumer Apps]
    D -->|Alias Imports| F[Danger: Collides with Consumer Config]
```

### 6.4. Summary
- **Source Code (`src/`):** ALWAYS use **Relative Paths** (`../../`).
- **Tests (`test/`):** SAFE to use **Aliases** (`@test/`) because tests are never distributed to consumers.


## 7. Git Configuration

### 7.1. Ignored Files (`.gitignore`)

The following files are excluded from version control to maintain a clean repository:

| Pattern | Description |
| :--- | :--- |
| `coverage/` | Test coverage reports generated by Vitest. |
| `.nyc_output/` | Istanbul/NYC intermediate coverage data. |
| `.vitest/` | Vitest cache and temporary files. |
| `test-results/` | Artifacts from test runs. |
| `playwright-report/` | Reports from Playwright e2e tests (if applicable). |

---

## 8. Project Structure

```
packages/core-ui/
├── src/                # Source code (Component primitives)
│   ├── atoms/          # Basic building blocks
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex structures
│   └── layouts/        # Layout systems
├── test/               # Test setup & shared utilities
├── dist/               # Build output (Git ignored)
└── ...config files
```

---

## 9. Testing

We use [Vitest](https://vitest.dev/) for unit and component testing.

### 9.1. Tech Stack

| Library | Purpose |
| :--- | :--- |
| **[Vitest](https://vitest.dev/)** | Blazing fast unit test framework (powered by Vite) |
| **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** | Utilities to test React components in a user-centric way |
| **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** | Custom DOM element matchers (e.g., `toBeInTheDocument`) |
| **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro)** | Simulate user interactions (clicks, typing) |
| **[jsdom](https://github.com/jsdom/jsdom)** | Headless browser environment for Node.js |
| **[@vitest/coverage-v8](https://vitest.dev/guide/coverage.html)** | Native V8 code coverage provider |

### 9.2. Configuration (`vitest.config.ts`)






#### `test` Configuration
Core settings for the testing environment and runner execution.

| Option | Value | Detailed Breakdown |
| :--- | :--- | :--- |
| `globals` | `true` | Enables global usage of `describe`, `it`, `expect`. If `false` (default), you must import them in every test file. |
| `environment` | `jsdom` | Simulates browser APIs (`window`, `document`) for React components. Requires `jsdom` package. Alt: `happy-dom` (faster), `node` (backend). |
| `setupFiles` | `['./test/setup.ts']` | Path to setup script. Runs *before* each test file to polyfill APIs missing in JSDOM (e.g., `ResizeObserver`, `matchMedia`). |
| `include` | `['src/**/*.{test,spec}.{ts,tsx}']` | Exact glob pattern used to identify test files. |
| `exclude` | `[`<br>`node_modules`<br>`dist`<br>`.idea`<br>`.git`<br>`.cache`<br>`**/node_modules/**`<br>`**/*.stories.tsx`<br>`]` | List of folders/files explicitly ignored by the test runner. |
| `pool` | `threads` | Execution strategy. `threads` (default) provides true file-level isolation using Worker Threads to prevent global pollution. |
| `testTimeout` | `10000` | Maximum execution time (10s) per test. Default is 5s. Increased to prevent false failures in slower CI environments. |
| `hookTimeout` | `10000` | Maximum execution time (10s) for hooks (`beforeAll`, `afterEach`, etc.). Prevents heavy setup/cleanup from hanging indefinitely. |
| `retry` | `1` | Automatically retries a failing test 1 time. Helps mitigate "flaky" tests that fail randomly due to environment issues. |
| `clearMocks` | `true` | Automatically calls `.mockClear()` on all spies/mocks before each test. Prevents call history from leaking between tests. |
| `mockReset` | `true` | Automatically calls `.mockReset()` before each test. Clears mock history AND resets implementations to `undefined`. |
| `restoreMocks` | `true` | Automatically calls `.mockRestore()` before each test. Restores original implementations of spied methods. |

#### `test.coverage` Configuration
Settings for code coverage collection and reporting (using V8).

| Option | Value | Detailed Breakdown |
| :--- | :--- | :--- |
| `provider` | `v8` | Uses Node.js built-in V8 coverage engine. Faster and more accurate than the legacy `istanbul` (babel-based) provider. |
| `reporter` | `text`<br>`json`<br>`html`<br>`lcov` | Output formats. `text` (console summary), `json`/`html` (CI artifacts), `lcov` (compatible with SonarQube/Codecov). |
| `clean` | `true` | Cleans the output directory before generating new coverage reports to avoid stale data. |
| `thresholds` | `lines: 80`<br>`functions: 80`<br>`branches: 75`<br>`statements: 80` | **Quality Gate Breakdown:**<br>• **Statements (80%)**: Are 80% of instructions executed?<br>• **Branches (75%)**: Are 75% of decision points (if/else/switch) taken?<br>• **Functions (80%)**: Are 80% of functions called at least once?<br>• **Lines (80%)**: Are 80% of lines of code executed? |
| `include` | `['src/**/*.{ts,tsx}']` | Strict whitelist. Only source code is considered for coverage calculation. |
| `exclude` | `**/*.test.{ts,tsx}`<br>`**/*.spec.{ts,tsx}`<br>`**/*.stories.tsx`<br>`**/index.ts`<br>`**/*.d.ts`<br>`**/types.ts`<br>`**/test/**` | List of non-source files to ignore for accurate coverage metrics. |



#### Other Configuration (`plugins`, `resolve`)

| Option | Value | Detailed Breakdown |
| :--- | :--- | :--- |
| `plugins` | `react()` | Vite plugin for React. Handles JSX transformation, Fast Refresh, and component compilation in tests. |
| `resolve.alias` | `@test` → `./test` | Maps `@test/*` to `./test/*`. Allows imports like `import { render } from '@test/utils'` instead of `../../test/utils`. |



### 9.4. Global Test Setup (`test/setup.ts`)
This file runs *before* every test suite to ensure a consistent environment.

| Component | Purpose | Details |
| :--- | :--- | :--- |
| **`cleanup()`** | **Auto-Cleanup** | Runs `afterEach` test to unmount React trees. Prevents DOM leakage between tests. |
| **`@testing-library/jest-dom`** | **Matchers** | Imports custom matchers like `.toBeInTheDocument()` globally. |
| **`window.matchMedia`** | **Polyfill** | Mocks CSS media queries. Essential for testing components with `useMediaQuery` or responsive designs. |
| **`IntersectionObserver`** | **Polyfill** | Mocks the Observer API. Used by lazy-loaded images or "in-view" animations. |
| **`ResizeObserver`** | **Polyfill** | Mocks element resizing. Used by responsive layouts or charts. |
| **`window.scrollTo`** | **Mock** | Prevents errors when components try to scroll the window (not supported in JSDOM). |
| **`requestAnimationFrame`** | **Mock** | Simulates animation frames immediately (synchronous) so tests don't wait for real time. |
| **Console Suppression** | **DX** | Suppresses React's verbose `act()` warnings in the console to keep test output clean. |

### 9.5. Key Commands


| Command | Description |
| :--- | :--- |
| `pnpm test` | Run tests in watch mode (interactive) |
| `pnpm test:ui` | Open Vitest UI for visual debugging |
| `pnpm test:run` | Run all tests once (CI mode) |
| `pnpm test:watch` | Explicit watch mode alias (same as `pnpm test`) |
| `pnpm test:coverage` | Generate code coverage report |
| `pnpm test:coverage:ui` | Generate coverage report and open in UI |

### 9.4. Writing Tests

1.  **Location**: Place test files next to source files or in `test/` directory.
    - Pattern: `MyComponent.test.tsx`
2.  **Helpers**: Use `@test/utils` for rendering with providers.

```tsx
import { renderWithProviders, screen } from '@test/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 9.5. Coverage Requirements

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
