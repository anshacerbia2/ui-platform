# Quick Reference: @scnx/core-ui Tree Shaking

## Import Patterns

### ✅ Correct (Use These)

```typescript
// Atoms
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';

// Organisms
import { NavbarBase } from '@scnx/core-ui/organisms/navbar-base';
import { SidebarBase } from '@scnx/core-ui/organisms/sidebar-base';

// Templates
import { EdgeLayout } from '@scnx/core-ui/templates/edge-layout';
import { FloatingLayout } from '@scnx/core-ui/templates/floating-layout';
```

### ❌ Incorrect (Will Error)

```typescript
// Barrel import - NO LONGER SUPPORTED
import { ButtonBase } from '@scnx/core-ui';
```

## Available Components

| Category      | Component      | Import Path                               |
| ------------- | -------------- | ----------------------------------------- |
| **Atoms**     | ButtonBase     | `@scnx/core-ui/atoms/button-base`         |
| **Organisms** | NavbarBase     | `@scnx/core-ui/organisms/navbar-base`     |
| **Organisms** | SidebarBase    | `@scnx/core-ui/organisms/sidebar-base`    |
| **Templates** | EdgeLayout     | `@scnx/core-ui/templates/edge-layout`     |
| **Templates** | FloatingLayout | `@scnx/core-ui/templates/floating-layout` |

## TypeScript Support

```typescript
import type { ButtonBaseProps } from '@scnx/core-ui/atoms/button-base';
import { ButtonBase } from '@scnx/core-ui/atoms/button-base';

const props: ButtonBaseProps = {
  // Fully typed
};
```

## Bundle Size Impact

| Import Method | Bundle Size | Savings |
| ------------- | ----------- | ------- |
| Old (Barrel)  | ~45KB       | -       |
| New (Subpath) | ~15KB       | **67%** |

## Build Commands

```bash
# Build the package
pnpm build

# Clean and rebuild
pnpm build --clean
```

## Documentation

- **[TREE_SHAKING_GUIDE.md](./TREE_SHAKING_GUIDE.md)** - Deep dive into tree shaking
- **[MIGRATION.md](./MIGRATION.md)** - Migration from barrel exports
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Configuration details

## Support

Questions? Check the documentation above or contact the team.
