# Background Token Reference
## Enterprise-Grade Design System — FAANG-Grade Architectural Standard

> **Scope:** Dokumentasi arsitektur background tokens (`bg-*`) untuk `@scnx/system`. 
> Panduan ini mendefinisikan taksonomi token, model mental ketinggian (*Elevation Stack*), serta pembagian tanggung jawab yang ketat antara **Tier-2 (Semantic System)** dan **Tier-3 (Component & Layout Overrides)**.

---

## 🏛️ Arsitektur Token 3-Tier (SSOT)

Untuk menjaga skalabilitas *cross-platform* dan kepatuhan terhadap OCP (Open-Closed Principle), sistem token kita dibagi menjadi tiga layer terisolasi:

```
┌──────────────────────────────────────────────┐
│  Tier-1: Core Primitives (ref/color)         │  <-- Raw values (e.g. neutral-100, blue-500)
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Mapping Semantik)
┌──────────────────────────────────────────────┐
│  Tier-2: Semantic System (sys/bg)            │  <-- Bebas-konteks komponen (e.g. bg-surface, bg-hover)
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Alias Komponen)
┌──────────────────────────────────────────────┐
│  Tier-3: Component Overrides (comp/button)   │  <-- Terikat komponen spesifik (e.g. bg-input, bg-table-row-hover)
└──────────────────────────────────────────────┘
```

*   **Tier-1 (Core):** Nilai mentah palet warna tanpa arti semantik.
*   **Tier-2 (Semantic):** Token bernilai dinamis (Light/Dark/Dim) yang mencerminkan **peran semantik** dan **state interaktif** global, bebas dari pengetahuan tentang nama komponen spesifik.
*   **Tier-3 (Component):** Token spesifik untuk tiap komponen yang di-alias langsung ke Tier-2. Ini memastikan perubahan gaya pada satu komponen tidak merusak komponen lainnya.

---

## Mental Model: Elevation Stack (Tier-2)

Setiap permukaan dalam antarmuka memiliki "ketinggian visual" yang direpresentasikan oleh gradasi warna, bukan sekadar bayangan (*shadow*).
*   **Light Mode:** Semakin tinggi level elevasi, warna permukaan semakin terang (makin dekat dengan sumber cahaya).
*   **Dark Mode (Inversed):** Semakin tinggi level elevasi, warna permukaan semakin terang (menggunakan overlay neutral untuk merepresentasikan kedekatan visual).

```
LIGHT MODE (Makin tinggi = Makin Terang)
──────────────────────────────────────────────────────────────────
bg-canvas             neutral-0     #ffffff  ← Level dasar viewport
  └─ bg-surface       neutral-100   #fafafa  ← Kontainer panel & card
       └─ bg-surface-raised  neutral-200 #f1f2f3  ← Popover, dropdown, card raised
            └─ bg-surface-overlay neutral-200 #f1f2f3  ← Modal backdrop overlay content

DARK MODE (Makin tinggi = Makin Terang / Ditimpa Tint)
──────────────────────────────────────────────────────────────────
bg-canvas             neutral-0     #040404  ← Viewport gelap pekat
  └─ bg-surface       neutral-100   #0a0b0c  ← Panel dasar
       └─ bg-surface-raised  neutral-200 #131415  ← Permukaan naik
            └─ bg-surface-overlay neutral-300 #202224  ← Popover / modal content
```

---

## 1. Surface / Canvas (Tier-2 Semantic)

Foundation dari semua struktur halaman. Dideklarasikan secara global di tingkat sistem.

| Token | Light Value | Dark Value | Deskripsi Semantik / Use Case |
|---|---|---|---|
| `bg-canvas` | `neutral-0` | `neutral-0` | Background paling dasar viewport (`<body>`, halaman kosong). |
| `bg-canvas-panel` | `neutral-0` | `neutral-0` | Area panel dasar di atas canvas (sering kali aliased ke canvas). |
| `bg-canvas-inset` | `neutral-300` | `neutral-400` | Alternating section untuk segmentasi visual landing page/marketing. |
| `bg-surface` | `neutral-100` | `neutral-100` | Kontainer utama untuk konten: Card, Panel, Sidebar container. |
| `bg-surface-subtle` | `neutral-300` | `neutral-300` | Muted section, secondary background untuk area konten sekunder. |
| `bg-surface-raised` | `neutral-200` | `neutral-200` | Elevasi popover, dropdown, menu, dan card yang membutuhkan separasi visual. |
| `bg-surface-overlay` | `neutral-200` | `neutral-200` | Area isi modal (terpisah dari scrim gelap di belakangnya). |
| `bg-surface-sunken` | `neutral-300` | `neutral-400` | Well container, sunken wells, inset card, dan background editor/code. |
| `bg-surface-floating` | `white` | `neutral-100` | Calendar, Autocomplete, Tooltip mengambang (selalu bersih, lepas dari parent stacking). |

---

## 2. Interactive & State Overlays (Tier-2 Semantic)

> [!IMPORTANT]
> **Aturan Emas Composability:**
> Semua token hover, pressed, dan selected **wajib menggunakan warna Alpha channel**, bukan warna solid. 
> Hover solid akan menjadi invisible jika diletakkan di atas permukaan dengan warna solid yang sama. Overlay Alpha menjamin perubahan tingkat kegelapan/keterangan tetap kontras di atas elevasi permukaan mana pun.

| Token | Value (RGB) | Alpha (%) | Semantik Use Case |
|---|---|---|---|
| `bg-hover` | `neutral-300A` | ~7% | State kursor melayang di atas baris tabel, item menu, atau tombol ghost. |
| `bg-pressed` | `neutral-400A` | ~15% | State elemen sedang diklik/ditekan (active mouse-down). |
| `bg-selected` | `neutral-200A` | ~4% | Penanda item atau baris tabel yang telah dipilih/dicheck. |
| `bg-dragging` | `neutral-300A` | ~24% | Elemen yang sedang digeser (drag and drop lifecycle). |
| `bg-drop-target` | `primary-subtle` | — | Area target yang aktif dan siap menerima drop item. |
| `bg-active` | `neutral-200` | — | State aktif fungsional umum (navigasi aktif, toggle ON). |
| `bg-current` | `primary-subtle` | — | Penanda halaman/tab aktif saat ini yang sedang dikunjungi. |
| `bg-open` | `neutral-100` | — | State terbuka untuk menu dropdown trigger, disclosure, accordion. |

*Note: State fokus tidak menggunakan background token, melainkan direpresentasikan oleh `border-focus` + `focus-ring` untuk mencegah layout noise.*

---

## 3. State & Feedback (Tier-2 Semantic)

| Token | Light Value | Dark Value | Semantik Use Case |
|---|---|---|---|
| `bg-disabled` | `neutral-200` | `neutral-200` | Komponen yang dinonaktifkan secara sengaja (permanent muted state). |
| `bg-skeleton` | `neutral-300` | `neutral-300` | Warna dasar placeholder komponen yang sedang loading. |
| `bg-skeleton-shimmer` | *Gradient* | *Gradient* | Animasi gerak cahaya linear pada skeleton loading. |

### Implementasi Shimmer Gradient:
```scss
--ds-bg-skeleton-shimmer: linear-gradient(
  90deg,
  rgb(var(--ds-neutral-200)) 0%,
  rgb(var(--ds-neutral-100)) 50%,
  rgb(var(--ds-neutral-200)) 100%
);
```

---

## 4. Intent Backgrounds (Tier-2 Semantic)

Digunakan untuk alert banner, callout, chip, badge, dan toast. **Selalu dipisahkan antara Subtle (tint tipis) dan Solid (warna tebal).**

### Subtle (Tint Tipis — Untuk alert box, callout, status chip outline)
*   `bg-info-subtle` (Blue-100) — Informasi umum.
*   `bg-success-subtle` (Green-100) — Aksi sukses / status positif.
*   `bg-warning-subtle` (Yellow-100) — Peringatan minor.
*   `bg-danger-subtle` (Red-100) — Kesalahan kritis / status bahaya.
*   `bg-accent-subtle` (Magenta-100) — Promosi, highlight sekunder.
*   `bg-neutral-subtle` (Neutral-200) — Status secondary, pending, atau netral.

### Solid (Warna Tebal — Untuk filled badge, notification dot, toast fill)
*   `bg-info-solid` (Blue-800) $\rightarrow$ Teks pendamping: `white`
*   `bg-success-solid` (Green-800) $\rightarrow$ Teks pendamping: `neutral-1000` (Dark text wajib untuk kontras WCAG)
*   `bg-warning-solid` (Yellow-800) $\rightarrow$ Teks pendamping: `neutral-1000` (Dark text wajib untuk kontras WCAG)
*   `bg-danger-solid` (Red-800) $\rightarrow$ Teks pendamping: `white`
*   `bg-accent-solid` (Magenta-800) $\rightarrow$ Teks pendamping: `neutral-1000`
*   `bg-neutral-solid` (Neutral-700) $\rightarrow$ Teks pendamping: `white`

---

## 5. Inverse, Scrim & Brand (Tier-2 Semantic)

### Inverse (Untuk dark mode elements di light theme)
*   `bg-inverse` (`neutral-1100`) — Tooltip gelap, snackbar hitam di atas halaman putih.
*   `bg-inverse-subtle` (`neutral-900`) — Sub-kontainer gelap di dalam inverse layout.

### Scrim & Overlay
*   `bg-scrim` (`black / 50%`) — Backdrop gelap penutup viewport di belakang modal dialog/drawer.
*   `bg-scrim-light` (`white / 30%`) — Backdrop putih tipis di atas gambar/video player controls.
*   `bg-glass` (`neutral-0 / 80%` + blur) — Glassmorphism, header sticky blur transparan.
*   `bg-glass-dark` (`neutral-1100 / 70%` + blur) — Glassmorphism mode gelap.

### Brand
*   `bg-brand` (`primary-base`) — Main CTA Button, accent area identitas aplikasi.
*   `bg-brand-subtle` (`neutral-200`) — Segmented brand area, secondary branding container.
*   `bg-brand-inverse` (`white`) — Area putih kontras di dalam blok brand solid gelap.

---

## 🔌 Tier-3: Component & Layout Overrides Reference

> [!NOTE]
> **Prinsip Bebas Polusi:**
> Token-token di bawah ini **TIDAK BOLEH** didaftarkan di tingkat global contract `_contract-token.scss`. 
> Token ini dikompilasi secara lokal pada stylesheet komponen masing-masing, mengambil nilai alias dari Tier-2.

### 1. Code Component (`packages/design-system/src/components/atoms/code`)
*   `bg-code` $\rightarrow$ resolves to `bg-surface-sunken` (inline code background)
*   `bg-code-block` $\rightarrow$ resolves to `bg-canvas` (preformatted code block container)
*   `bg-code-highlight` $\rightarrow$ resolves to `yellow-200A` (gradient/alpha highlight line)

### 2. Input Component (`packages/design-system/src/components/atoms/input`)
*   `bg-input` $\rightarrow$ resolves to `bg-canvas`
*   `bg-input-hover` $\rightarrow$ resolves to `bg-surface-sunken`
*   `bg-input-focus` $\rightarrow$ resolves to `bg-canvas` (focused state ditandai oleh border-focus)
*   `bg-input-disabled` $\rightarrow$ resolves to `bg-disabled`
*   `bg-input-error` $\rightarrow$ resolves to `bg-danger-subtle`

### 3. Table Component (`packages/design-system/src/components/organisms/table`)
*   `bg-table-header` $\rightarrow$ resolves to `bg-surface`
*   `bg-table-row` $\rightarrow$ resolves to `transparent`
*   `bg-table-row-hover` $\rightarrow$ resolves to `bg-hover` (alpha)
*   `bg-table-row-selected` $\rightarrow$ resolves to `bg-selected` (alpha)
*   `bg-table-row-striped` $\rightarrow$ resolves to `bg-surface-subtle`

### 4. Navigation & Layouts
Suku kata layout fisik seperti `layout-sidebar-bg` dan `layout-navbar-bg` dihapus dari global contract, dan dipetakan di level komponen layout:
*   `bg-navbar` $\rightarrow$ resolves to `bg-canvas`
*   `bg-sidebar` $\rightarrow$ resolves to `bg-surface`
*   `bg-sidebar-item-hover` $\rightarrow$ resolves to `bg-hover`
*   `bg-sidebar-item-active` $\rightarrow$ resolves to `bg-active`

---

## 📝 SCSS Tier-2 Semantic Contract Template

Berikut adalah daftar token background murni Tier-2 yang sah dideklarasikan di [_contract-token.scss](file:///d:/Ansha/js/module_federation_v1.5/packages/design-system/src/styles/abstracts/_contract-token.scss):

```scss
// abstracts/_contract-token.scss — color section (bg tokens only)
$system: (
  color: (
    // ─── SURFACE / CANVAS (Tier-2) ───
    bg-canvas,
    bg-canvas-panel,
    bg-canvas-inset,
    bg-surface,
    bg-surface-subtle,
    bg-surface-raised,
    bg-surface-overlay,
    bg-surface-sunken,
    bg-surface-floating,

    // ─── INTERACTIVE OVERLAYS (Tier-2) ───
    bg-hover,
    bg-pressed,
    bg-selected,
    bg-dragging,
    bg-drop-target,
    bg-active,
    bg-current,
    bg-open,

    // ─── INTERACTION STATES (Tier-2) ───
    bg-disabled,
    bg-skeleton,
    bg-skeleton-shimmer,

    // ─── INTENT SUBTLE (Tier-2) ───
    bg-info-subtle,
    bg-success-subtle,
    bg-warning-subtle,
    bg-danger-subtle,
    bg-accent-subtle,
    bg-neutral-subtle,

    // ─── INTENT SOLID (Tier-2) ───
    bg-info-solid,
    bg-success-solid,
    bg-warning-solid,
    bg-danger-solid,
    bg-accent-solid,
    bg-neutral-solid,

    // ─── INVERSE (Tier-2) ───
    bg-inverse,
    bg-inverse-subtle,

    // ─── OVERLAYS & SCRIMS (Tier-2) ───
    bg-scrim,
    bg-scrim-light,
    bg-glass,
    bg-glass-dark,

    // ─── BRAND (Tier-2) ───
    bg-brand,
    bg-brand-subtle,
    bg-brand-inverse,
  )
);
```

---

## 🔍 Checklist — Quality Assurance

- [x] **Pemisahan OCP:** Tidak ada token bernada komponen (`table-*`, `input-*`, `nav-*`) di dalam global contract.
- [x] **Alpha Overlay:** Semua interaksi (`bg-hover`, `bg-pressed`, `bg-selected`, `bg-dragging`) menggunakan warna Alpha/RGBa.
- [x] **WCAG Contrast Checker:** Solid intent tokens dibarengi panduan tipe teks pendamping yang lolos kontras 4.5:1 / 3:1.
- [x] **Zero-Reflow Layout:** Token fisik layout (`layout-sidebar-bg`, `layout-navbar-bg`) direlokasi keluar dari global contract menuju Tier-3 lokal.