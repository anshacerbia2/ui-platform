# Internal API Isolation Patterns

> Strategies for exposing internal APIs within a monorepo while preventing external access.

---

## The Problem

In a monorepo, higher-level packages (e.g., `design-system`) often need access to internal utilities from lower-level packages (e.g., `core-ui`). However, these internals should not be accessible to external consumers who install packages from npm.

```
┌────────────────────────────────────────────────────┐
│                    Monorepo                        │
│                                                    │
│  ┌──────────┐     needs      ┌──────────────────┐  │
│  │ core-ui  │ ◄───────────── │  design-system   │  │
│  │ internal │                │                  │  │
│  └──────────┘                └──────────────────┘  │
│       ▲                                            │
│       │ should NOT access                          │
│  ┌────┴─────────────────────────────────────────┐  │
│  │              External npm users              │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## Approach 1: Separate Internal Package

Create a dedicated package for internal APIs that is never published to npm.

### Structure

```
packages/
  core-ui/              # @scnx/core-ui (published)
  core-ui-internal/     # @scnx/core-ui-internal (NOT published)
  design-system/        # @scnx/design-system (published)
```

### Implementation

**core-ui-internal/package.json:**
```json
{
  "name": "@scnx/core-ui-internal",
  "private": true,
  "exports": {
    "./navigation-level": "./src/navigation-level/index.ts"
  }
}
```

**design-system/package.json:**
```json
{
  "dependencies": {
    "@scnx/core-ui": "workspace:*",
    "@scnx/core-ui-internal": "workspace:*"
  }
}
```

**Usage in design-system:**
```typescript
// Public API
import { NavigationBase } from "@scnx/core-ui/components/navigation-base";

// Internal API (monorepo only)
import { useNavigationLevel } from "@scnx/core-ui-internal/navigation-level";
```

### How It Works

| Environment | `@scnx/core-ui-internal` available? |
|-------------|-------------------------------------|
| Monorepo dev | ✅ Yes (workspace resolution) |
| npm install | ❌ No (not published) |

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ True isolation | ⚠️ Additional package overhead |
| ✅ TypeScript enforces boundaries | ⚠️ More package.json to maintain |
| ✅ Explicit intent | ⚠️ Workspace dependency management |
| ✅ Can't accidentally expose | |

---

## Approach 2: Build-Time Stripping

Maintain separate index files for development vs. npm builds.

### Structure

```
navigation-base/
  index.ts          # Full exports (development)
  index.public.ts   # Public exports only (npm build)
  NavigationBase.tsx
  NavigationLevelContext.tsx
```

### Implementation

**index.ts (development):**
```typescript
// Public
export { NavigationBase } from "./NavigationBase";

// Internal (stripped in npm build)
export { useNavigationLevel, NavigationLevelContext } from "./NavigationLevelContext";
```

**index.public.ts (npm build):**
```typescript
// Public only
export { NavigationBase } from "./NavigationBase";
```

**rollup.config.js:**
```javascript
export default {
  input: {
    'navigation-base': process.env.BUILD_TARGET === 'npm'
      ? 'src/components/navigation-base/index.public.ts'
      : 'src/components/navigation-base/index.ts'
  },
  // ...
}
```

**tsconfig.json (dev paths):**
```json
{
  "compilerOptions": {
    "paths": {
      "@scnx/core-ui/components/navigation-base": [
        "./src/components/navigation-base/index.ts"
      ]
    }
  }
}
```

### How It Works

| Environment | Resolves to | Internal available? |
|-------------|-------------|---------------------|
| Dev (monorepo) | `index.ts` | ✅ Yes |
| npm bundle | `index.public.ts` | ❌ No |

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Single package | ⚠️ Two index files to sync |
| ✅ Less overhead | ⚠️ Complex build config |
| ✅ Faster dev setup | ⚠️ Risk of sync issues |
| | ⚠️ Human error prone |

---

## Comparison Matrix

| Criteria | Separate Package | Build-Time Stripping |
|----------|------------------|----------------------|
| **Isolation guarantee** | ✅ Strong | ⚠️ Relies on build |
| **Dev overhead** | Higher | Lower |
| **Build complexity** | Standard | Custom config |
| **Maintenance** | Clear boundaries | Sync two files |
| **Team size fit** | Large teams | Small teams |
| **Risk of leaking** | Very low | Medium |

---

## Recommendation

| Scenario | Recommended Approach |
|----------|---------------------|
| Enterprise / Large team | **Separate Internal Package** |
| Small team / Rapid iteration | **Build-Time Stripping** |
| Prototype / MVP | Export all with docs warning |

---

## Notes

- Neither approach provides runtime security—both are **development-time boundaries**
- The goal is **discoverability control**, not encryption
- Both patterns are used by major libraries (React, MUI, etc.)
