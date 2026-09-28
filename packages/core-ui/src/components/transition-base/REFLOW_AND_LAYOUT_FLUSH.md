# Reflow & Layout Flush: Arsitektur Determinisme Animasi

> Dokumen ini menjelaskan mekanisme internal browser mengenai Reflow dan Layout Flushing, serta alasan teknis mengapa `TransitionBase` menggunakannya secara eksplisit untuk menjamin animasi yang mulus.

---

## 1. Apa itu Reflow?

**Reflow** (atau disebut juga **Layout**) adalah proses di mana browser menghitung ulang posisi dan geometri elemen-elemen di dalam dokumen. 

Dalam **Critical Rendering Path**, Reflow terjadi setelah pembangunan *Render Tree* dan sebelum fase *Painting*. Browser harus menentukan secara matematis koordinat $(x, y)$ dan dimensi (lebar & tinggi) setiap elemen berdasarkan model kotak (box model).

### Kapan Reflow Terjadi?
- Menambah atau menghapus elemen dari DOM.
- Mengubah gaya yang mempengaruhi geometri (misal: `width`, `height`, `padding`, `margin`, `font-size`).
- Mengubah isi konten (misal: teks di dalam input).
- Mengubah ukuran jendela browser (Resize).

### Optimasi Scope: CSS `contain`
Browser modern memiliki fitur optimasi jangkauan reflow. Jika sebuah elemen memiliki properti `contain: layout` atau `contain: size`, browser dapat membatasi kalkulasi geometri hanya di dalam sub-tree elemen tersebut tanpa harus menghitung ulang seluruh halaman. Ini secara signifikan mengurangi biaya performa dari sebuah Layout Flush.

---

## 2. Mekanisme Layout Flushing

Secara default, browser sangat cerdas. Browser tidak akan melakukan Reflow setiap kali kita mengubah gaya lewat JavaScript. Browser akan **antre (queue)** perubahan tersebut dan melakukannya secara massal (*batching*) pada akhir frame untuk menghemat CPU.

**Layout Flush** adalah sebuah interupsi manual yang kita lakukan untuk memaksa browser mengosongkan antrean tersebut dan menghitung layout **saat itu juga**.

### Mengapa Kita Butuh Flush?
Dalam animasi "Height Auto", kita sering melakukan dua hal secara berurutan:
1. Mengubah gaya (misal: mematikan animasi atau set tinggi ke 0).
2. Meminta dimensi elemen (misal: bertanya `scrollHeight`-nya berapa).

Jika kita tidak melakukan *flush* di antara kedua langkah ini, browser mungkin akan memberikan nilai dari langkah ke-2 berdasarkan layout "lama" (sebelum langkah ke-1 diproses), karena antrean langkah ke-1 belum dieksekusi.

---

## 3. Pemicu Layout Flush (Trigger Properties)

Mengakses properti berikut pada elemen DOM akan memaksa browser melakukan Layout Flush secara instan:

| Kategori | Properti Pemicu |
| :--- | :--- |
| **Box Geometry** | `offsetHeight`, `offsetWidth`, `offsetLeft`, `offsetTop` |
| **Scroll Geometry** | `scrollHeight`, `scrollWidth`, `scrollTop`, `scrollLeft` |
| **Client Geometry** | `clientHeight`, `clientWidth`, `clientTop`, `clientLeft` |
| **Computed Styles** | `window.getComputedStyle(element)` |
| **View Geometry** | `getBoundingClientRect()` |

---

## 4. Pola Implementasi di TransitionBase

Di dalam `TransitionBase.tsx`, Anda akan menemukan pola berikut:

```tsx
// Force Reflow (Manual Layout Flush for Deterministic Animation)
void nodeRef.current.offsetHeight;
```

### Bedah Teknis Pola:
1.  **Akses Properti**: Kita mengakses `offsetHeight`. Ini memberi tahu browser: *"Saya butuh angka tinggi fisik sekarang juga!"*. Browser terpaksa menghentikan semua optimasi batching dan menghitung layout agar bisa memberikan angka yang akurat.
2.  **Keyword `void`**: Kita tidak butuh nilainya, kita cuma butuh *side-effect*-nya (reflow). `void` secara eksplisit menandakan bahwa nilai kembalian akan dibuang, menghindari peringatan linter dan menghemat alokasi variabel.
3.  **Determinisme**: Dengan melakukan ini tepat sebelum `scrollHeight`, kita menjamin bahwa `scrollHeight` yang kita dapatkan adalah nilai yang benar-benar sinkron dengan perubahan gaya terakhir.

---

## 5. Bahaya: Layout Thrashing

**Layout Thrashing** terjadi jika kita melakukan Reflow secara berulang-ulang dalam satu frame (misal: Loop yang isinya `Write Style` -> `Read Layout` -> `Write Style`). Ini sangat mahal karena CPU dipaksa bekerja berkali-kali untuk hal yang sama.

### Cara TransitionBase Menghindari Thrashing:
- **Batching via Double-RAF**: Kita membungkus logika transisi di dalam `requestAnimationFrame`.
- **Strategic Reflow**: Kita hanya melakukan satu kali Reflow manual tepat sebelum fase *measurement* yang kritikal.
- **Zero-Stack Frame**: Kita membersihkan antrean frame lama (`cancelAnimationFrame`) sebelum memulai siklus baru.

---

## 6. Kesimpulan Architect

Reflow bukanlah sesuatu yang harus ditakuti, tapi harus **dikelola**. Dalam pembuatan komponen animasi tingkat tinggi (*Elite Grade*), memahami kapan harus membiarkan browser batching dan kapan harus memaksa *flush* adalah perbedaan antara animasi yang "terlihat oke" dan animasi yang "terasa sempurna (smooth)".

---

© 2026 SCNX UI System. Arsitektur Performa Tinggi.
