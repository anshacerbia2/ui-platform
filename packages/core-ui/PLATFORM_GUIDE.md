# Platform Configuration Guide: Browser vs Node vs Neutral

## TL;DR

For **React component libraries** that may be used in SSR (Next.js, Remix):

```typescript
platform: 'neutral'; // ✅ CORRECT - SSR compatible
```

---

## Why We Use `platform: "neutral"` for @scnx/core-ui

### The SSR Requirement

Modern React frameworks use **Server-Side Rendering (SSR)**:

- **Next.js** - Renders React on server first
- **Remix** - Server-side rendering by default
- **Gatsby** - Static site generation with SSR

**Problem with `platform: "browser"`:**

```typescript
// With platform: "browser"
// Bundler assumes browser-only environment
// May inject browser-specific polyfills
// Can cause issues during SSR in Node.js
```

**Solution with `platform: "neutral"`:**

```typescript
// With platform: "neutral"
// No environment assumptions
// Works in Node.js (SSR) AND browser (client)
// Universal compatibility
```

---

## Platform Options Explained

### 1. `platform: "browser"`

**Use Case:** Browser-only libraries

```typescript
platform: 'browser';
```

**Characteristics:**

- Assumes `window`, `document`, `navigator` available
- No Node.js built-ins (`fs`, `path`, etc.)
- May inject browser-specific polyfills
- Optimized for browser environment

**When to Use:**

- ❌ **NOT for React component libraries** (SSR issues)
- ✅ Canvas/WebGL libraries (Three.js)
- ✅ Browser API wrappers (LocalStorage, IndexedDB)
- ✅ DOM manipulation utilities

**Examples:**

```typescript
// Three.js (uses WebGL)
platform: 'browser';

// Chart.js (uses Canvas API)
platform: 'browser';

// Browser-only utility
export function getLocalStorage() {
  return window.localStorage; // Assumes browser
}
```

---

### 2. `platform: "node"`

**Use Case:** Node.js-only libraries

```typescript
platform: 'node';
```

**Characteristics:**

- Assumes Node.js environment
- Can use `fs`, `path`, `process`, etc.
- No browser globals
- Optimized for Node.js runtime

**When to Use:**

- ✅ CLI tools
- ✅ Backend utilities
- ✅ Build tools
- ✅ Server-side libraries

**Examples:**

```typescript
// CLI tool
platform: 'node';

// Backend utility
export async function readConfig() {
  const fs = await import('node:fs/promises');
  return fs.readFile('config.json'); // Assumes Node.js
}
```

---

### 3. `platform: "neutral"` ⭐ **RECOMMENDED for React Libraries**

**Use Case:** Universal/isomorphic libraries

```typescript
platform: 'neutral';
```

**Characteristics:**

- **No environment assumptions**
- Works in browser AND Node.js
- No polyfills injected
- Smallest bundle size
- **SSR compatible**

**When to Use:**

- ✅ **React component libraries** (SSR support)
- ✅ Vue/Svelte component libraries
- ✅ Pure JavaScript utilities
- ✅ Validation libraries
- ✅ Date/time utilities

**Examples:**

```typescript
// React component (SSR-compatible)
platform: "neutral"

export const ButtonBase = ({ children }) => {
  return <button>{children}</button>;
  // Works in SSR (Node.js) and browser
};

// Pure utility
export const formatDate = (date) => {
  return new Date(date).toISOString();
  // No environment-specific APIs
};
```

---

## Real-World Library Examples

### React Component Libraries (Use `neutral`)

| Library           | Platform  | Reason                          |
| ----------------- | --------- | ------------------------------- |
| **Radix UI**      | `neutral` | SSR-compatible React components |
| **Chakra UI**     | `neutral` | Used in Next.js apps            |
| **React Aria**    | `neutral` | Adobe's accessible components   |
| **Mantine**       | `neutral` | Full-stack React framework      |
| **@scnx/core-ui** | `neutral` | Our library (SSR support)       |

### Browser-Only Libraries (Use `browser`)

| Library           | Platform  | Reason                    |
| ----------------- | --------- | ------------------------- |
| **Three.js**      | `browser` | WebGL (browser-only API)  |
| **Chart.js**      | `browser` | Canvas API (browser-only) |
| **Leaflet**       | `browser` | DOM manipulation          |
| **Monaco Editor** | `browser` | Browser-specific APIs     |

### Node.js Libraries (Use `node`)

| Library       | Platform | Reason           |
| ------------- | -------- | ---------------- |
| **Commander** | `node`   | CLI framework    |
| **Chalk**     | `node`   | Terminal colors  |
| **Inquirer**  | `node`   | CLI prompts      |
| **Express**   | `node`   | Server framework |

### Universal Libraries (Use `neutral`)

| Library      | Platform  | Reason               |
| ------------ | --------- | -------------------- |
| **Lodash**   | `neutral` | Pure utilities       |
| **Date-fns** | `neutral` | Date utilities       |
| **Zod**      | `neutral` | Validation           |
| **Ramda**    | `neutral` | Functional utilities |

---

## SSR Compatibility Test

### ❌ Problem with `platform: "browser"`

```typescript
// Component library built with platform: "browser"
export const MyComponent = () => {
  return <div>Hello</div>;
};

// Next.js app (SSR)
import { MyComponent } from '@scnx/core-ui';

export default function Page() {
  return <MyComponent />;  // ❌ May fail during SSR
}

// Error during SSR:
// ReferenceError: window is not defined
// (if bundler injected browser-specific code)
```

### ✅ Solution with `platform: "neutral"`

```typescript
// Component library built with platform: "neutral"
export const MyComponent = () => {
  return <div>Hello</div>;
};

// Next.js app (SSR)
import { MyComponent } from '@scnx/core-ui';

export default function Page() {
  return <MyComponent />;  // ✅ Works in SSR + browser
}

// SSR (Node.js): Renders to HTML string
// Browser: Hydrates and becomes interactive
```

---

## Conditional Environment Code

If you need environment-specific code in a `neutral` library:

```typescript
// Safe environment detection
export const isBrowser = typeof window !== 'undefined';
export const isNode = typeof process !== 'undefined';

// Conditional logic
export function getEnvironment() {
  if (isBrowser) {
    return 'browser';
  }
  else if (isNode) {
    return 'node';
  }
  return 'unknown';
}

// Conditional API usage
export const storage = {
  get: (key: string) => {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
    // Fallback for SSR
    return null;
  },
};
```

---

## Bundle Size Impact

### Platform: "browser"

```
Input:  10KB
Output: 12KB (browser polyfills added)
```

### Platform: "node"

```
Input:  10KB
Output: 11KB (Node.js optimizations)
```

### Platform: "neutral"

```
Input:  10KB
Output: 10KB (no assumptions, smallest)
```

**Winner:** `neutral` has the smallest bundle size! ✅

---

## Decision Matrix

### For @scnx/core-ui (React Component Library)

```typescript
✅ platform: "neutral"
```

**Reasons:**

1. **SSR Compatible** - Works in Next.js, Remix
2. **Universal** - Runs in Node.js and browser
3. **Smallest Bundle** - No environment-specific code
4. **Future-Proof** - Works with any React framework
5. **Industry Standard** - Used by Radix UI, Chakra UI

### General Guidelines

| Library Type                        | Platform  | Example                    |
| ----------------------------------- | --------- | -------------------------- |
| **React Components (SSR)**          | `neutral` | `@scnx/core-ui`            |
| **React Components (browser-only)** | `browser` | Canvas-based chart library |
| **Vue/Svelte Components**           | `neutral` | Component libraries        |
| **Pure Utilities**                  | `neutral` | Lodash, Date-fns           |
| **CLI Tools**                       | `node`    | Commander, Inquirer        |
| **Backend Libraries**               | `node`    | Express, Fastify           |
| **Browser APIs**                    | `browser` | LocalStorage wrapper       |

---

## Common Mistakes

### ❌ Mistake 1: Using `browser` for React Libraries

```typescript
// ❌ BAD: Assumes browser-only
platform: 'browser';

// Problem: Breaks SSR in Next.js
```

### ❌ Mistake 2: Using `node` for Universal Code

```typescript
// ❌ BAD: Can't run in browser
platform: 'node';

// Problem: Won't work in client-side React
```

### ✅ Correct: Use `neutral` for React Libraries

```typescript
// ✅ GOOD: Works everywhere
platform: 'neutral';

// Works in: SSR (Node.js) + Browser
```

---

## Testing Platform Choice

### Test 1: SSR Compatibility

```bash
# Create Next.js test app
npx create-next-app@latest test-app

# Install your library
npm install @scnx/core-ui

# Test SSR
# app/page.tsx
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';

export default function Page() {
  return <ButtonBase>Test</ButtonBase>;
}

# Run dev server
npm run dev

# Check for errors in SSR
# ✅ Should work without errors
```

### Test 2: Browser Compatibility

```bash
# Build for production
npm run build

# Check browser console
# ✅ Should work without errors
```

### Test 3: Bundle Analysis

```bash
# Analyze bundle
npm run build
npm run analyze

# Check for:
# ✅ No browser-specific polyfills
# ✅ No Node.js built-ins
# ✅ Clean, minimal output
```

---

## Summary

### For @scnx/core-ui

**Configuration:**

```typescript
platform: 'neutral'; // ✅ CORRECT
```

**Why:**

1. ✅ **SSR Compatible** - Works in Next.js
2. ✅ **Universal** - Node.js + Browser
3. ✅ **Smallest Bundle** - No polyfills
4. ✅ **Industry Standard** - Best practice
5. ✅ **Future-Proof** - Works with any framework

### Quick Reference

```typescript
// React component library (SSR support)
platform: 'neutral'; // ✅

// Browser-only library (Canvas, WebGL)
platform: 'browser'; // ✅

// Node.js CLI/backend
platform: 'node'; // ✅

// Pure utilities
platform: 'neutral'; // ✅
```

---

## Conclusion

**You were RIGHT!** 🎯

For `@scnx/core-ui`, we should use `platform: "neutral"` because:

1. **SSR Compatibility** - Next.js, Remix support
2. **Universal Code** - Works in server + client
3. **Best Practice** - Industry standard for React libraries
4. **Smallest Bundle** - No environment assumptions

This ensures your library works seamlessly in modern React frameworks with SSR! ✅
