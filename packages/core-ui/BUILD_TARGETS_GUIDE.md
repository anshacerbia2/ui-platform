# Build Targets Guide: Choosing the Right ECMAScript Target

## Why We Use `target: "es2020"` in Tsup Config

### Decision Rationale

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'es2020', // ← Why this specific target?
});
```

**Reasons for ES2020:**

1. **Modern Browser Support (95%+ coverage)**
   - Chrome 80+ (Feb 2020)
   - Firefox 74+ (Mar 2020)
   - Safari 13.1+ (Mar 2020)
   - Edge 80+ (Feb 2020)

2. **Native Features Available**
   - `Promise.allSettled()`
   - `String.prototype.matchAll()`
   - `BigInt` support
   - `globalThis`
   - Optional chaining (`?.`)
   - Nullish coalescing (`??`)
   - Dynamic `import()`

3. **Optimal Bundle Size**
   - No polyfills needed for modern features
   - Smaller transpilation overhead
   - Native async/await (no regenerator runtime)

4. **Performance Benefits**
   - Native `class` fields
   - Native `async/await`
   - Native `Promise` methods
   - Faster execution in modern engines

5. **Developer Experience**
   - Write modern JavaScript
   - Less transpilation = faster builds
   - Better source maps

### Trade-offs

**✅ Pros:**

- Smaller bundle size
- Better performance
- Modern syntax support
- Faster builds

**⚠️ Cons:**

- Drops IE11 support (acceptable in 2024+)
- Requires modern browsers
- May need polyfills for older environments

---

## Complete Target Reference

### Target Comparison Table

| Target     | Year   | Browser Support         | Use Case         | Bundle Size     | Features                               |
| ---------- | ------ | ----------------------- | ---------------- | --------------- | -------------------------------------- |
| **ES5**    | 2009   | IE9+                    | Legacy support   | ❌ Largest      | Basic JS                               |
| **ES2015** | 2015   | IE11+ (with polyfills)  | Legacy apps      | ❌ Large        | Classes, arrow functions               |
| **ES2016** | 2016   | Chrome 52+, Firefox 48+ | Older browsers   | ⚠️ Medium-Large | `**` operator                          |
| **ES2017** | 2017   | Chrome 58+, Firefox 52+ | Moderate support | ⚠️ Medium       | Async/await                            |
| **ES2018** | 2018   | Chrome 63+, Firefox 58+ | Good support     | ✅ Medium-Small | Rest/spread for objects                |
| **ES2019** | 2019   | Chrome 73+, Firefox 64+ | Modern browsers  | ✅ Small        | `Array.flat()`, `Object.fromEntries()` |
| **ES2020** | 2020   | Chrome 80+, Firefox 74+ | **Recommended**  | ✅ Small        | Optional chaining, nullish coalescing  |
| **ES2021** | 2021   | Chrome 85+, Firefox 79+ | Very modern      | ✅ Smallest     | Logical assignment                     |
| **ES2022** | 2022   | Chrome 94+, Firefox 93+ | Cutting edge     | ✅ Smallest     | Top-level await, class fields          |
| **ESNext** | Latest | Latest browsers only    | Experimental     | ✅ Smallest     | All latest features                    |

---

## Detailed Target Breakdown

### ES5 (2009)

```typescript
target: 'es5';
```

**Browser Support:**

- IE9+
- All modern browsers

**Features:**

- Basic JavaScript
- `Object.create()`
- `Array.forEach()`, `map()`, `filter()`
- Strict mode

**When to Use:**

- ❌ **NOT RECOMMENDED** in 2024+
- Only if supporting IE9-10
- Legacy enterprise applications

**Bundle Impact:**

```
Source: 10KB
ES5 Output: 45KB (with polyfills)
Overhead: 350%
```

---

### ES2015 (ES6) (2015)

```typescript
target: 'es2015';
```

**Browser Support:**

- IE11 (with polyfills)
- Chrome 51+
- Firefox 54+
- Safari 10+

**Features:**

- `class` syntax
- Arrow functions
- Template literals
- `let`/`const`
- Destructuring
- Modules (`import`/`export`)
- `Promise`
- `Map`, `Set`

**When to Use:**

- Supporting IE11
- Legacy enterprise requirements
- Maximum compatibility

**Bundle Impact:**

```
Source: 10KB
ES2015 Output: 25KB (with some polyfills)
Overhead: 150%
```

---

### ES2016 (2016)

```typescript
target: 'es2016';
```

**Browser Support:**

- Chrome 52+
- Firefox 48+
- Safari 10.1+
- Edge 14+

**New Features:**

- `**` (exponentiation operator)
- `Array.prototype.includes()`

**When to Use:**

- Minimal improvement over ES2015
- Rarely used as a target

---

### ES2017 (2017)

```typescript
target: 'es2017';
```

**Browser Support:**

- Chrome 58+
- Firefox 52+
- Safari 11+
- Edge 15+

**New Features:**

- `async`/`await`
- `Object.values()`, `Object.entries()`
- String padding (`padStart`, `padEnd`)
- Trailing commas in function parameters

**When to Use:**

- Need `async`/`await` without transpilation
- Moderate browser support requirements
- Good balance for 2020-2022 projects

**Bundle Impact:**

```
Source: 10KB
ES2017 Output: 15KB
Overhead: 50%
```

---

### ES2018 (2018)

```typescript
target: 'es2018';
```

**Browser Support:**

- Chrome 63+
- Firefox 58+
- Safari 11.1+
- Edge 79+

**New Features:**

- Rest/spread for objects (`{...obj}`)
- `Promise.finally()`
- Async iteration (`for await...of`)
- RegExp improvements

**When to Use:**

- Modern applications (2021+)
- Need object spread without transpilation
- Good browser support

---

### ES2019 (2019)

```typescript
target: 'es2019';
```

**Browser Support:**

- Chrome 73+
- Firefox 64+
- Safari 12.1+
- Edge 79+

**New Features:**

- `Array.flat()`, `flatMap()`
- `Object.fromEntries()`
- `String.trimStart()`, `trimEnd()`
- Optional `catch` binding

**When to Use:**

- Modern web applications
- No IE11 support needed
- Good balance of features and support

**Bundle Impact:**

```
Source: 10KB
ES2019 Output: 12KB
Overhead: 20%
```

---

### ES2020 (2020) ⭐ **RECOMMENDED**

```typescript
target: 'es2020';
```

**Browser Support:**

- Chrome 80+ (Feb 2020)
- Firefox 74+ (Mar 2020)
- Safari 13.1+ (Mar 2020)
- Edge 80+ (Feb 2020)

**New Features:**

- Optional chaining (`obj?.prop`)
- Nullish coalescing (`value ?? default`)
- `Promise.allSettled()`
- `BigInt`
- `globalThis`
- Dynamic `import()`
- `String.matchAll()`

**When to Use:**

- ✅ **RECOMMENDED** for most projects in 2024+
- Modern web applications
- Component libraries (like `@scnx/core-ui`)
- No legacy browser support needed
- Optimal bundle size vs features

**Bundle Impact:**

```
Source: 10KB
ES2020 Output: 11KB
Overhead: 10%
```

**Why This is the Sweet Spot:**

- 95%+ browser coverage globally
- Native optional chaining (huge DX win)
- Native nullish coalescing
- No async/await transpilation
- Minimal polyfills needed
- Great performance

---

### ES2021 (2021)

```typescript
target: 'es2021';
```

**Browser Support:**

- Chrome 85+ (Aug 2020)
- Firefox 79+ (Jul 2020)
- Safari 14+ (Sep 2020)
- Edge 85+ (Aug 2020)

**New Features:**

- Logical assignment operators (`||=`, `&&=`, `??=`)
- `String.replaceAll()`
- `Promise.any()`
- Numeric separators (`1_000_000`)
- `WeakRef`

**When to Use:**

- Very modern applications
- Internal tools
- Latest browser requirements
- Slightly smaller bundles than ES2020

**Bundle Impact:**

```
Source: 10KB
ES2021 Output: 10.5KB
Overhead: 5%
```

---

### ES2022 (2022)

```typescript
target: 'es2022';
```

**Browser Support:**

- Chrome 94+ (Sep 2021)
- Firefox 93+ (Oct 2021)
- Safari 15.4+ (Mar 2022)
- Edge 94+ (Sep 2021)

**New Features:**

- Top-level `await`
- Class fields (public/private)
- Private methods
- Static class blocks
- `Array.at()`
- `Object.hasOwn()`

**When to Use:**

- Cutting-edge applications
- Internal tools
- Latest browser requirements
- Want native class fields

**Bundle Impact:**

```
Source: 10KB
ES2022 Output: 10.2KB
Overhead: 2%
```

---

### ESNext (Latest)

```typescript
target: 'esnext';
```

**Browser Support:**

- Latest browsers only
- Experimental features

**Features:**

- All latest ECMAScript proposals
- Stage 3+ features
- Bleeding edge

**When to Use:**

- ⚠️ **NOT RECOMMENDED** for libraries
- Experimental projects
- Internal development
- Testing new features

**Risk:**

- Features may change
- Browser support uncertain
- May break in production

---

## Decision Matrix

### For Component Libraries (like @scnx/core-ui)

```typescript
// ✅ RECOMMENDED
target: 'es2020';
```

**Reasoning:**

- Wide browser support (95%+)
- Modern features (optional chaining, nullish coalescing)
- Optimal bundle size
- Good performance
- Consumer can transpile down if needed

### For Web Applications

| App Type              | Recommended Target   | Reasoning       |
| --------------------- | -------------------- | --------------- |
| **Modern SaaS**       | `es2020` or `es2021` | Best balance    |
| **Enterprise (IE11)** | `es2015`             | Legacy support  |
| **Internal Tools**    | `es2022`             | Latest features |
| **Public Website**    | `es2019` or `es2020` | Wide support    |
| **Mobile App**        | `es2021` or `es2022` | Modern devices  |

### For Node.js Libraries

| Node Version | Recommended Target |
| ------------ | ------------------ |
| Node 12.x    | `es2019`           |
| Node 14.x    | `es2020`           |
| Node 16.x    | `es2021`           |
| Node 18.x+   | `es2022`           |

---

## Browser Support Statistics (2024)

| Target     | Global Coverage | Notes              |
| ---------- | --------------- | ------------------ |
| ES5        | 99.9%           | Includes IE11      |
| ES2015     | 98.5%           | Drops IE10         |
| ES2017     | 97.8%           | Native async/await |
| ES2019     | 96.5%           | Array.flat()       |
| **ES2020** | **95.2%**       | **Sweet spot**     |
| ES2021     | 94.1%           | Very modern        |
| ES2022     | 92.8%           | Cutting edge       |

_Source: caniuse.com (December 2024)_

---

## Practical Examples

### Example 1: Component Library (Our Case)

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'es2020', // ✅ Optimal for libraries
  format: ['esm', 'cjs'],
  // Consumer can transpile down if needed
});
```

**Why ES2020:**

- Library consumers likely use modern bundlers
- They can transpile down if needed
- Smaller library bundle
- Better tree shaking with modern syntax

### Example 2: Legacy Enterprise App

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'es2015', // Support IE11
  format: ['cjs'],
  // Include polyfills in consumer app
});
```

### Example 3: Modern SaaS Application

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020', // Modern browsers only
  },
});
```

### Example 4: Node.js CLI Tool

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'node16', // Node.js 16+ specific
  format: ['esm'],
});
```

---

## Testing Your Target Choice

### 1. Check Browser Support

```bash
# Use browserslist to check coverage
npx browserslist "chrome >= 80, firefox >= 74, safari >= 13.1"
```

### 2. Analyze Bundle Size

```bash
# Build with different targets
pnpm build

# Check output size
ls -lh dist/
```

### 3. Test in Target Browsers

```javascript
// Feature detection
if (typeof globalThis === 'undefined') {
  console.error('ES2020 not supported');
}
```

---

## Common Mistakes

### ❌ Mistake 1: Using ESNext for Libraries

```typescript
// ❌ BAD: Unstable features
target: 'esnext';
```

**Problem:** Features may change, breaking consumers.

### ❌ Mistake 2: Too Conservative

```typescript
// ❌ BAD: Unnecessary transpilation
target: 'es5'; // In 2024+
```

**Problem:** Huge bundle size, slow builds, poor performance.

### ❌ Mistake 3: Mismatched Targets

```typescript
// tsconfig.json
{
  "target": "es2022"  // ❌ Doesn't match tsup
}

// tsup.config.ts
{
  target: "es2020"  // ❌ Doesn't match tsconfig
}
```

**Solution:** Keep them aligned or let tsup override.

---

## Recommendations Summary

### For @scnx/core-ui (Component Library)

```typescript
✅ target: "es2020"
```

**Reasons:**

1. 95%+ browser coverage
2. Modern features (optional chaining, nullish coalescing)
3. Optimal bundle size
4. Consumers can transpile down if needed
5. Industry standard for modern libraries

### General Guidelines

| Project Type          | Target               | Reasoning                     |
| --------------------- | -------------------- | ----------------------------- |
| **Component Library** | `es2020`             | Balance of features + support |
| **Modern Web App**    | `es2020` - `es2021`  | Best performance              |
| **Legacy Enterprise** | `es2015`             | IE11 support                  |
| **Internal Tools**    | `es2022`             | Latest features               |
| **Node.js Library**   | `node16` or `es2021` | Match Node version            |
| **Mobile App**        | `es2021`             | Modern devices                |

---

## Further Reading

- [ECMAScript Compatibility Table](https://kangax.github.io/compat-table/es2016plus/)
- [Can I Use](https://caniuse.com/)
- [Browserslist](https://browsersl.ist/)
- [esbuild Target Documentation](https://esbuild.github.io/api/#target)
- [TypeScript Target Documentation](https://www.typescriptlang.org/tsconfig#target)

---

## Conclusion

**For `@scnx/core-ui`, we use `target: "es2020"` because:**

1. ✅ **95%+ browser coverage** - Wide enough for production
2. ✅ **Modern features** - Optional chaining, nullish coalescing
3. ✅ **Optimal bundle size** - Minimal transpilation overhead
4. ✅ **Industry standard** - Used by Radix UI, Chakra UI, etc.
5. ✅ **Future-proof** - Aligned with modern JavaScript ecosystem
6. ✅ **Consumer flexibility** - They can transpile down if needed

This is the **sweet spot** for component libraries in 2024 and beyond.
