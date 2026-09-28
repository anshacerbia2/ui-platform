# Tree Shaking Guide: Enterprise-Grade JavaScript Library Optimization

## Table of Contents

1. [What is Tree Shaking?](#what-is-tree-shaking)
2. [Tree Shaking Requirements](#tree-shaking-requirements)
3. [Barrel Exports: The Trade-off](#barrel-exports-the-trade-off)
4. [Export Strategies](#export-strategies)
5. [Dependency Graph Analysis](#dependency-graph-analysis)
6. [Package.json Configuration](#packagejson-configuration)
7. [Build Tool Configuration](#build-tool-configuration)
8. [Best Practices](#best-practices)
9. [Real-World Examples](#real-world-examples)

---

## What is Tree Shaking?

**Tree shaking** is a dead-code elimination technique used by modern JavaScript bundlers to remove unused exports from the final bundle. The term comes from the mental model of "shaking" a dependency tree to remove "dead leaves" (unused code).

### Key Characteristics

- **Static Analysis**: Bundlers analyze import/export statements at build time
- **ESM-Only**: Requires ES Modules (`import`/`export`), not CommonJS (`require`)
- **Universal**: Works for ANY JavaScript code, not just React
- **Build-Time Optimization**: Happens during bundling, not runtime

### Universal Applicability

Tree shaking works across all JavaScript ecosystems:

```javascript
// Node.js Backend
import { readFile, writeFile } from 'node:fs/promises';

// React Components
import { Button } from '@scnx/core-ui/atoms/button-base';

// Date Utilities
import { addDays, format } from 'date-fns';

// Utility Libraries
import { debounce, throttle } from 'lodash-es';

// 3D Graphics
import { PerspectiveCamera, Scene } from 'three';

// Vue Composition API
import { computed, ref } from 'vue';
```

### Impact Example

```javascript
// Without tree shaking
import _ from 'lodash';
// Bundle: ~500KB (entire library)

// With tree shaking
import { debounce } from 'lodash-es';

_.debounce(fn, 300);
debounce(fn, 300);
// Bundle: ~5KB (only debounce function)
// Reduction: 99%
```

---

## Tree Shaking Requirements

For optimal tree shaking, your library must satisfy three critical requirements:

### 1. ESM Format (ES Modules)

**Why**: Bundlers can only statically analyze ESM syntax.

```javascript
// ✅ Tree shakeable (ESM)
import { ButtonBase } from '@scnx/core-ui';

// ❌ NOT tree shakeable (CommonJS)
const { ButtonBase } = require('@scnx/core-ui');

// ❌ NOT tree shakeable (Dynamic import)
const module = await import('@scnx/core-ui');
```

**Package.json Configuration**:

```json
{
  "type": "module",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

### 2. Side Effects Declaration

**Why**: Tells bundlers which files can be safely eliminated if unused.

```json
{
  "sideEffects": false
}
```

**What are side effects?**

```javascript
// ❌ HAS side effects (modifies global state)
window.myGlobal = 'value';
document.body.classList.add('loaded');

// ❌ HAS side effects (executes on import)
console.log('Module loaded');
analytics.track('import');

// ✅ NO side effects (pure exports)
export function ButtonBase() { /* ... */ }
export function formatDate(date) { /* ... */ }
```

**Selective Side Effects**:

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 3. Static Imports/Exports

**Why**: Bundlers need compile-time analysis, not runtime.

```javascript
// ✅ Static (tree shakeable)
export { ButtonBase } from './ButtonBase';
export const utils = { /* ... */ };

// ❌ Dynamic (NOT tree shakeable)
const components = {};
if (condition) {
  components.Button = require('./Button');
}
export default components;
```

---

## Barrel Exports: The Trade-off

### What is a Barrel Export?

A **barrel** is an `index.ts` file that re-exports from multiple modules for convenience.

```typescript
// src/index.ts (BARREL)
// User convenience
import { ButtonBase, NavbarBase } from '@scnx/core-ui';

export * from './atoms/button-base/ButtonBase';
export * from './organisms/navbar-base/NavbarBase';
export * from './organisms/sidebar-base/SidebarBase';
```

### The Problem with Barrels

#### Issue 1: Module Graph Coupling

```typescript
// User only wants ButtonBase
import { ButtonBase } from '@scnx/core-ui';

// Bundler must:
// 1. Parse index.ts (barrel)
// 2. See ALL exports (ButtonBase, NavbarBase, SidebarBase)
// 3. Create module graph for ALL components
// 4. Attempt tree shaking (success depends on bundler sophistication)
```

**Dependency Graph**:

```
User App
  └─> @scnx/core-ui (barrel index)
       ├─> ButtonBase ✓ (used)
       ├─> NavbarBase ✗ (unused, should be shaken)
       └─> SidebarBase ✗ (unused, should be shaken)
```

**Result**: Modern bundlers (Webpack 5+, Rollup, Vite) can tree shake this, but it requires more work and creates larger intermediate module graphs.

#### Issue 2: Wildcard Export Risks

```typescript
// src/atoms/button-base/ButtonBase.tsx
export function ButtonBase() { /* ... */ }
export const INTERNAL_CONSTANT = 'secret'; // Internal use
export function debugHelper() { /* ... */ } // Debug only
export interface ButtonBaseProps { /* ... */ }

// src/atoms/button-base/index.ts (WILDCARD)
export * from './ButtonBase'; // ← Exports EVERYTHING!
```

**Unintended Public API**:

```typescript
// User can access internals
import {
  ButtonBase, // ✓ Intended
  ButtonBaseProps, // ✓ Intended
  debugHelper, // ❌ NOT intended (debug)
  INTERNAL_CONSTANT // ❌ NOT intended (internal)
} from '@scnx/core-ui/atoms/button-base';
```

**Consequences**:

- **API Surface Bloat**: Larger public API, harder to maintain
- **Breaking Change Risk**: Renaming internal constant = breaking change
- **Bundle Size**: Bundler may include unused exports
- **Security**: Internal utilities exposed

### Barrel vs. Direct Subpath Comparison

| Aspect            | Barrel Export                   | Direct Subpath                               |
| ----------------- | ------------------------------- | -------------------------------------------- |
| **Import Syntax** | `import { Button } from '@pkg'` | `import { Button } from '@pkg/atoms/button'` |
| **Convenience**   | ✅ High (single import point)   | ⚠️ Medium (must know paths)                  |
| **Tree Shaking**  | ⚠️ Moderate (bundler-dependent) | ✅ Perfect (guaranteed)                      |
| **Module Graph**  | ❌ Couples all exports          | ✅ Isolated per component                    |
| **Bundle Size**   | ⚠️ Larger intermediate graph    | ✅ Minimal graph                             |
| **API Control**   | ⚠️ Risk of leaking internals    | ✅ Explicit control                          |
| **Maintenance**   | ✅ Easy (single entry)          | ⚠️ More package.json config                  |

---

## Export Strategies

### Strategy 1: Explicit Exports (Recommended)

**Always use explicit named exports**, never wildcard, at all levels.

#### Per-Component Index (Explicit)

```typescript
// src/atoms/button-base/index.ts
export { ButtonBase } from './ButtonBase';
export type { ButtonBaseProps } from './ButtonBase';
// ← Only exports intended public API
```

#### Root Index (Explicit)

```typescript
// src/index.ts - Option B: Re-export from per-component index
export { ButtonBase, type ButtonBaseProps } from './atoms/button-base';
// src/index.ts - Option A: Direct re-export
export { ButtonBase } from './atoms/button-base/ButtonBase';
export type { ButtonBaseProps } from './atoms/button-base/ButtonBase';
export { NavbarBase, type NavbarBaseProps } from './organisms/navbar-base';

export { NavbarBase } from './organisms/navbar-base/NavbarBase';
export type { NavbarBaseProps } from './organisms/navbar-base/NavbarBase';
```

**Benefits**:

- ✅ **Full API Control**: Only intended exports are public
- ✅ **Better Tree Shaking**: Bundlers can trace exact dependencies
- ✅ **Maintainable**: Clear public API contract
- ✅ **Safe**: No accidental internal leaks

### Strategy 2: Wildcard Exports (Avoid)

```typescript
// ❌ AVOID: Wildcard in root index
export * from './atoms/button-base/ButtonBase';
// ❌ AVOID: Wildcard in per-component index
export * from './ButtonBase';

export * from './organisms/navbar-base/NavbarBase';
```

**Why Avoid**:

- Exports ALL named exports (including internals)
- Harder to track public API surface
- Risk of breaking changes when refactoring
- Slightly worse tree shaking in some bundlers

### Strategy 3: Internal Imports

**Within your library**, always use direct source imports, never barrel imports.

```typescript
// src/organisms/navbar-base/NavbarBase.tsx

// ❌ WRONG: Import from package name (circular risk)
import { ButtonBase } from '@scnx/core-ui';

// ✅ CORRECT: Direct import from source
import { ButtonBase } from '../../atoms/button-base/ButtonBase';

// ❌ WRONG: Import from barrel
import { ButtonBase } from '../../index';
```

**Why**:

- Clear dependency graph
- Bundler can optimize better
- No circular dependency risk
- Faster build times

---

## Dependency Graph Analysis

### Scenario: NavbarBase Uses ButtonBase

```typescript
// src/atoms/button-base/ButtonBase.tsx
export const ButtonBase = () => <button />;

// src/organisms/navbar-base/NavbarBase.tsx
import { ButtonBase } from '../../atoms/button-base/ButtonBase';

export const NavbarBase = () => (
  <nav>
    <ButtonBase>Menu</ButtonBase>
  </nav>
);
```

### User Import Scenarios

#### Scenario 1: User Imports Only NavbarBase

```typescript
// User code
import { NavbarBase } from '@scnx/core-ui/organisms/navbar-base';

// Bundle includes:
// ✓ NavbarBase (explicitly imported)
// ✓ ButtonBase (dependency of NavbarBase)
// ✗ SidebarBase (not imported, tree shaken)
```

**Dependency Graph**:

```
User App
  └─> @scnx/core-ui/organisms/navbar-base
       └─> NavbarBase
            └─> ButtonBase (internal dependency)
```

#### Scenario 2: User Imports Both NavbarBase and ButtonBase

```typescript
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';
// User code
import { NavbarBase } from '@scnx/core-ui/organisms/navbar-base';

// Bundle includes:
// ✓ NavbarBase
// ✓ ButtonBase (imported once, shared/deduplicated)
```

**Dependency Graph**:

```
User App
  ├─> @scnx/core-ui/organisms/navbar-base
  │    └─> NavbarBase
  │         └─> ButtonBase (shared)
  └─> @scnx/core-ui/atoms/button-base
       └─> ButtonBase (deduplicated by bundler)
```

**Key Insight**: Modern bundlers (Webpack, Rollup, Vite) automatically deduplicate shared dependencies. `ButtonBase` is only bundled once, even though it's imported by both user code and `NavbarBase`.

### Internal Dependencies Are Normal

**IMPORTANT**: Internal component dependencies (e.g., Navbar using Button) are **completely normal and correct**. The bundler will:

1. Trace all dependencies
2. Include only what's needed
3. Deduplicate shared modules
4. Optimize the final bundle

This is **not a tree shaking problem**—it's the expected behavior.

---

## Package.json Configuration

### Modern Approach: Exports Field Only

**Node.js 12.20+, Modern Bundlers (2020+)**

```json
{
  "name": "@scnx/core-ui",
  "version": "1.0.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./atoms/button-base": {
      "import": {
        "types": "./dist/atoms/button-base/index.d.ts",
        "default": "./dist/atoms/button-base/index.mjs"
      },
      "require": {
        "types": "./dist/atoms/button-base/index.d.cts",
        "default": "./dist/atoms/button-base/index.js"
      }
    },
    "./organisms/navbar-base": {
      "import": {
        "types": "./dist/organisms/navbar-base/index.d.ts",
        "default": "./dist/organisms/navbar-base/index.mjs"
      },
      "require": {
        "types": "./dist/organisms/navbar-base/index.d.cts",
        "default": "./dist/organisms/navbar-base/index.js"
      }
    }
  },
  "files": ["dist"]
}
```

**NO `main`, `module`, `types` needed!** Modern tools prioritize `exports` field.

### Hybrid Approach: Backward Compatibility

**Supports legacy tools while providing modern optimizations**

```json
{
  "name": "@scnx/core-ui",
  "version": "1.0.0",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": "./dist/index.js"
    },
    "./atoms/button-base": {
      "import": {
        "types": "./dist/atoms/button-base/index.d.ts",
        "default": "./dist/atoms/button-base/index.mjs"
      },
      "require": "./dist/atoms/button-base/index.js"
    },
    "./organisms/navbar-base": {
      "import": {
        "types": "./dist/organisms/navbar-base/index.d.ts",
        "default": "./dist/organisms/navbar-base/index.mjs"
      },
      "require": "./dist/organisms/navbar-base/index.js"
    }
  },
  "files": ["dist"]
}
```

**Resolution Priority** (Modern Tools):

1. `exports` field (highest priority)
2. `module` field (fallback)
3. `main` field (fallback)

### Wildcard Subpath Exports

**For libraries with many components**

```json
{
  "name": "@scnx/core-ui",
  "version": "1.0.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./atoms/*": {
      "import": {
        "types": "./dist/atoms/*/index.d.ts",
        "default": "./dist/atoms/*/index.mjs"
      },
      "require": "./dist/atoms/*/index.js"
    },
    "./organisms/*": {
      "import": {
        "types": "./dist/organisms/*/index.d.ts",
        "default": "./dist/organisms/*/index.mjs"
      },
      "require": "./dist/organisms/*/index.js"
    },
    "./templates/*": {
      "import": {
        "types": "./dist/templates/*/index.d.ts",
        "default": "./dist/templates/*/index.mjs"
      },
      "require": "./dist/templates/*/index.js"
    }
  },
  "files": ["dist"]
}
```

**Benefits**:

- ✅ Auto-supports new components (no package.json update needed)
- ✅ Less maintenance overhead
- ✅ Clean, predictable pattern

**Trade-offs**:

- ⚠️ Less explicit (any path matches)
- ⚠️ Harder to deprecate specific exports
- ⚠️ May expose unintended paths if file structure changes

---

## Build Tool Configuration

### Tsup Configuration for Libraries

#### Pure Subpath (No Barrel)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // NO root index.ts entry
    'atoms/button-base/index': 'src/atoms/button-base/index.ts',
    'organisms/navbar-base/index': 'src/organisms/navbar-base/index.ts',
    'organisms/sidebar-base/index': 'src/organisms/sidebar-base/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  splitting: false, // Libraries should NOT split (let consumer handle)
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
  },
});
```

**Output Structure**:

```
dist/
  atoms/
    button-base/
      index.js
      index.mjs
      index.d.ts
  organisms/
    navbar-base/
      index.js
      index.mjs
      index.d.ts
    sidebar-base/
      index.js
      index.mjs
      index.d.ts
```

**NO `dist/index.js`!** Users must use subpath imports.

#### Hybrid (Barrel + Subpath)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts', // ← Barrel entry
    'atoms/button-base/index': 'src/atoms/button-base/index.ts',
    'organisms/navbar-base/index': 'src/organisms/navbar-base/index.ts',
    'organisms/sidebar-base/index': 'src/organisms/sidebar-base/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  splitting: false,
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
  },
});
```

**Output Structure**:

```
dist/
  index.js        ← Barrel
  index.mjs       ← Barrel
  index.d.ts      ← Barrel
  atoms/
    button-base/
      index.js
      index.mjs
      index.d.ts
  organisms/
    navbar-base/
      index.js
      index.mjs
      index.d.ts
```

### Why `splitting: false` for Libraries?

**Libraries should NOT code-split** because:

1. **Consumer Controls Final Bundle**: The application (Next.js, Vite, etc.) handles code splitting
2. **Avoid Double Bundling**: Library chunks + app chunks = complexity
3. **Simpler Distribution**: Single file per entry point
4. **Better Tree Shaking**: Consumer bundler has full visibility

**Code splitting happens at the application level**:

```typescript
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';
// User's Next.js app
import { NavbarBase } from '@scnx/core-ui/organisms/navbar-base';

// Next.js automatically:
// 1. Detects ButtonBase used in both imports
// 2. Creates shared chunk
// 3. Deduplicates code
// 4. Optimizes bundle splitting
```

---

## Best Practices

### 1. Always Use Explicit Exports

```typescript
// ✅ GOOD: Explicit exports
export { ButtonBase } from './ButtonBase';
export type { ButtonBaseProps } from './ButtonBase';

// ❌ BAD: Wildcard exports
export * from './ButtonBase';
```

### 2. Declare Side Effects Accurately

```json
{
  "sideEffects": false
}
```

Or be specific:

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 3. Provide Both Barrel and Subpath Exports

```json
{
  "exports": {
    ".": "./dist/index.mjs",
    "./atoms/*": "./dist/atoms/*/index.mjs"
  }
}
```

**Document the optimization**:

```typescript
/**
 * @deprecated Use subpath imports for better tree-shaking:
 * import { ButtonBase } from '@scnx/core-ui/atoms/button-base'
 */
export { ButtonBase } from './atoms/button-base';
```

### 4. Use Direct Imports Internally

```typescript
// src/organisms/navbar-base/NavbarBase.tsx

// ✅ GOOD
import { ButtonBase } from '../../atoms/button-base/ButtonBase';

// ❌ BAD
import { ButtonBase } from '../../index';
```

### 5. Generate Both ESM and CJS

```typescript
// tsup.config.ts
export default defineConfig({
  format: ['esm', 'cjs'], // Both formats
});
```

**Why**:

- ESM: Modern bundlers, optimal tree shaking
- CJS: Legacy Node.js, backward compatibility

### 6. External Dependencies

```typescript
// tsup.config.ts
export default defineConfig({
  external: ['react', 'react-dom'], // Don't bundle peer deps
});
```

### 7. TypeScript Declaration Files

```typescript
// tsup.config.ts
export default defineConfig({
  dts: true, // Generate .d.ts files
});
```

Ensure types are exported in `package.json`:

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      }
    }
  }
}
```

---

## Real-World Examples

### Lodash: ESM vs CommonJS

```javascript
// ❌ lodash (CommonJS, NOT tree shakeable)
import _ from 'lodash';
// Bundle: ~500KB

// ✅ lodash-es (ESM, tree shakeable)
import { debounce } from 'lodash-es';

_.debounce(fn, 300);
debounce(fn, 300);
// Bundle: ~5KB
// Savings: 99%
```

### Material-UI: Hybrid Approach

```json
{
  "name": "@mui/material",
  "main": "./index.js",
  "exports": {
    ".": "./index.js",
    "./Button": "./Button/index.js",
    "./TextField": "./TextField/index.js"
  }
}
```

```typescript
// Barrel (less optimal)
import { Button } from '@mui/material';

// Subpath (optimal)
import Button from '@mui/material/Button';
```

### Radix UI: Pure Subpath

```json
{
  "name": "@radix-ui/react-dialog",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

```typescript
// Single entry point per package
import * as Dialog from '@radix-ui/react-dialog';
```

### Three.js: Modular Architecture

```javascript
// ❌ Import everything (bad)
import * as THREE from 'three';
const scene = new THREE.Scene();
// Bundle: ~600KB

// ✅ Import only what's needed (good)
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
const scene = new Scene();
// Bundle: ~150KB
// Savings: 75%
```

---

## Summary Checklist

### For Library Authors

- [ ] Use ESM format (`"type": "module"`)
- [ ] Set `"sideEffects": false` (or specify side effect files)
- [ ] Use explicit exports (avoid wildcard `export *`)
- [ ] Provide `exports` field in package.json
- [ ] Generate both ESM and CJS formats
- [ ] External peer dependencies (don't bundle React, etc.)
- [ ] Generate TypeScript declaration files
- [ ] Use direct imports internally (not barrel imports)
- [ ] Document optimal import paths for users
- [ ] Test tree shaking with bundler analysis tools

### For Library Users

- [ ] Use subpath imports when available (`@pkg/atoms/button`)
- [ ] Prefer ESM imports over CommonJS
- [ ] Check bundle analyzer for unused code
- [ ] Use dynamic imports for code splitting (app-level)
- [ ] Configure bundler for optimal tree shaking

---

## Tools for Verification

### Bundle Analyzers

```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# Rollup Plugin Visualizer
npm install --save-dev rollup-plugin-visualizer

# Vite Bundle Visualizer
npm install --save-dev rollup-plugin-visualizer
```

### Tree Shaking Test

```typescript
// Create test app
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';

// Build and analyze
npm run build
npm run analyze

// Verify:
// ✓ Only ButtonBase code in bundle
// ✗ No NavbarBase, SidebarBase code
```

---

## Conclusion

Tree shaking is a **universal JavaScript optimization** that works across all ecosystems. By following these enterprise-grade practices:

1. **Use ESM format** with explicit exports
2. **Declare side effects** accurately
3. **Provide granular entry points** via `exports` field
4. **Let consumer bundlers** handle code splitting
5. **Document optimal import paths** for users

You'll create libraries that are:

- ✅ **Optimally tree shakeable** (minimal bundle size)
- ✅ **Developer-friendly** (clear API surface)
- ✅ **Maintainable** (explicit public API)
- ✅ **Future-proof** (modern standards)

**Remember**: Tree shaking is not React-specific—it's a fundamental JavaScript optimization that benefits all modern applications.
