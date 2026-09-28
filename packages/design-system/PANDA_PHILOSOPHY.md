# Panda CSS Philosophy & Enterprise Strategy

Dokumen ini menjelaskan mengapa `@scnx/system` menggunakan **Panda CSS** sebagai mesin penggerak desain sistem dan bagaimana menggunakannya dengan standar *Enterprise Grade*.

## 1. Prinsip Utama (The Core)

### 1.1 Zero-Runtime Performance
Panda CSS memproses semua gaya pada saat **build-time**. 
- **Manfaat**: Tidak ada beban CPU di browser untuk menghitung gaya, tidak ada masalah *Flicker of Unstyled Content* (FOUC), dan performa setara dengan CSS murni.

### 1.2 Type-Safe Styles (Deep Type-Safety)
Panda men-scan konfigurasi dan menghasilkan tipe data TypeScript yang akurat secara otomatis.
- **Safety**: Setiap token warna, spasi, dan varian divalidasi oleh IDE. Jika token diubah di `panda.config.ts`, TypeScript akan memberikan error di seluruh project yang menggunakan token tersebut.

### 1.3 Atomic Utility & Deduplication
Berbeda dengan SCSS tradisional yang bisa menduplikasi gaya yang sama di banyak tempat, Panda menggunakan pendekatan **Atomic CSS**.
- **Efisiensi**: Gaya yang sama (misal: `display: flex`) hanya akan di-generate menjadi satu class atomik global dan dipakai bersama oleh banyak komponen. Ini secara drastis mengurangi ukuran bundle CSS akhir.

## 2. Strategi Tiered Architecture

Penggunaan Panda harus disesuaikan dengan posisi komponen dalam hierarki desain sistem:

| Tier | Jenis | Tool Panda | Pendekatan |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Atoms/Primitives | `defineRecipe` (CVA) | **Kaku & Teratur**. Menggunakan Recipe untuk varian tetap (size, variant, intent). |
| **Tier 2** | Molecules | `css()` / Utility | **Komposisi**. Mengatur tata letak antar Atoms menggunakan utilitas layout. |
| **Tier 3** | Organisms | `css()` / Utility | **Struktur Halaman**. Menggabungkan Tier 1 & 2 untuk membangun fitur fungsional. |

> **Best Practice**: Hindari penggunaan Recipe di Tier 2/3. Recipe di level tinggi akan mematikan fleksibilitas komposisi dan menyulitkan pengaturan varian Atoms yang ada di dalamnya (Prop Drilling).

## 3. Strategi Enterprise Safety & Library

### 3.1 Partial Props & Default Variants
Untuk primitive layout (Container, Flex, Grid), kami menggunakan `Partial<RecipeVariantProps>` agar prop bersifat opsional.
- **Runtime Safety**: Jaring pengaman utama ada di level `panda.config.ts` melalui `defaultVariants`. 
- **Explicit React Safety**: Sangat disarankan untuk memberikan **explicit default parameter** pada destructuring props di komponen React untuk kejelasan (`size = "base"`).

### 3.2 Smart Hybrid (Panda + SCSS)
Mengingat library ini digunakan di luar monorepo dan harus di-*pre-generate* (bukan hanya live-scanning), kami menggunakan teknik campuran:
- **Panda untuk Base (Small Components)**: Komponen dasar seperti Flex/Grid tetap menggunakan Panda untuk `base` style agar mendapatkan manfaat **Deduplication** (satu class utilitas vs banyak class SCSS redundan).
- **SCSS untuk Foundational Visual**: Komponen visual kompleks (Button, Input) menggunakan SCSS untuk gaya dasar yang stabil dan Panda untuk varian logikanya.

## 4. Keunggulan Bundling

Dalam skala *enterprise*, Panda memberikan keunggulan ukuran bundle:
- **Live Scanning**: Jika aplikasi *consumer* menjalankan Panda, mereka hanya akan mengambil CSS yang benar-benar mereka gunakan (Zero unused CSS).
- **Static Preflight**: Untuk library distribusi, Panda memastikan basis utilitas yang kompak tanpa duplikasi porsi gaya di level class CSS.

---

*Gunakan Panda CSS bukan hanya untuk gaya, tapi untuk membangun sistem yang aman, terprediksi, dan berperforma tinggi.*
