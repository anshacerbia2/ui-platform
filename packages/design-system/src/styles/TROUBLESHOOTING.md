# SCSS Troubleshooting Guide

## 1. CSS Color Keyword Collision in Sass Maps

### Problem

When using `map.get()` with keys that are also **CSS color keywords** (e.g. `blue`, `red`, `green`, `orange`, `teal`, `purple`, `magenta`, `lime`, `yellow`, `white`, `black`), Sass treats these unquoted identifiers as **color values**, not strings.

This causes a **type mismatch** when a function receives a quoted string argument like `"blue"` and tries to look it up in a map where the key is the unquoted `blue` (which Sass internally stores as the color `rgb(0, 0, 255)`).

```scss
// This map key `blue` is stored internally as the COLOR value rgb(0,0,255)
$color: (
  blue: ( ... ),
);

// This function receives "blue" as a STRING — map.get fails silently (returns null)
@function get-color($hue) {
  @return map.get($color, $hue); // null! "blue" (string) ≠ blue (color)
}

.test {
  color: get-color("blue"); // ERROR: key not found
}
```

### Root Cause

| Expression | Sass Type | Internal Value |
|---|---|---|
| `blue` (unquoted) | `color` | `rgb(0, 0, 255)` |
| `"blue"` (quoted) | `string` | `blue` |
| `red` (unquoted) | `color` | `rgb(255, 0, 0)` |
| `neutral` (unquoted) | `string` | `neutral` (not a CSS keyword) |

`map.get()` uses **strict type equality**. A `string` key will never match a `color` key, even if they share the same name.

### Solution

Use `meta.inspect($key)` to convert any key to its **string representation** before comparison. This normalizes both color values and strings to plain text.

```scss
@use "sass:map";
@use "sass:meta";

@function get-color($hue, $shade: null, $mode: "light") {
  @each $key, $val in $color {
    // meta.inspect(blue) → "blue" (string), meta.inspect("neutral") → "neutral"
    @if meta.inspect($key) == $hue {
      // ... lookup logic
    }
  }
  @error "Invalid color hue: #{$hue}";
}
```

For **shade keys** (e.g. `100`, `100A`), use string interpolation:

```scss
@each $s-key, $s-val in $mode-map {
  @if "#{$s-key}" == "#{$shade}" {
    @return $s-val;
  }
}
```

### Affected Keys in This Design System

All chromatic hue names are CSS color keywords: `red`, `orange`, `yellow`, `lime`, `green`, `teal`, `blue`, `purple`, `magenta`. Additionally `white` and `black`.

The only safe (non-keyword) key is `neutral`.

### Prevention

- Always use the `get-color()` helper from `_core-token.scss` — never raw `map.get()` on `$color` with string arguments.
- If adding new hues, be aware that any CSS-named color (`aqua`, `coral`, `navy`, etc.) will trigger the same issue.
