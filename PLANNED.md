# TeachFlow — Planned Features

> Status: **proposed** — belum dimulai. Rencana dibuat 2026-08-11.

---

## 1. Student Submission & Grading (Nilai Portfolio Tinggi)

### Latar Belakang

Saat ini portal siswa _read-only_. Siswa bisa login, lihat dashboard, riwayat
absensi, dan assignment, tapi belum bisa mengumpulkan tugas, dan guru belum
bisa menilai. README mencatat ini sebagai deferred.

### Scope (MVP)

- **Submission** — siswa mengunggah file (PDF/gambar/Word, s.d. 16MB via
  Uploadthing) untuk sebuah assignment.
  - Ada relasi baru: `Submission` = `studentId + assignmentId + fileUrl + submittedAt`.
  - Satu student satu submission per assignment (`@@unique([studentId, assignmentId])`)
    → upload kedua = update (revisi).
- **Grading** — guru memberi `score` (0–100) dan `feedback` pada submission.
  - Status assignment: `not-submitted | submitted | graded`.
- **UI guru** — di halaman assignment: toggle "Lihat Submission" → tabel
  siswa + status + modal input nilai/feedback.
- **UI siswa** — di halaman assignment siswa: tombol upload/submit, badge
  status, tampilkan nilai + feedback dari guru.
- **Statistik** — rerata nilai per assignment (bar chart kecil di analytics).

### Pertimbangan Keamanan (standar proyek ini)

- `requireStudent()` + verifikasi `assignmentId` milik kelas siswa.
- `requireTeacher()` + ownership check assignment sebelum grade.
- Hanya file pembuat submission yang bisa dihapus/diubah.
- Halaman ungraded submission tidak boleh menampilkan submission kelas lain
  (cek `classId` lewat `AssignmentClass`).

### Skema Prisma (draft)

```prisma
model Submission {
  id           String     @id @default(cuid())
  studentId    String
  assignmentId String
  fileUrl      String
  fileName     String
  score        Int?       // null = belum dinilai
  feedback     String?
  submittedAt  DateTime   @default(now())
  gradedAt     DateTime?
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@unique([studentId, assignmentId])
}
```

### Langkah Kerja

1. Migration `add_submission`.
2. `lib/actions/submission.actions.ts` (submit, delete, grade, list).
3. Uploadthing router baru `submissionUploader` (guru & siswa, file count 1/task).
4. UI guru (submission list + grading dialog) & UI siswa (submit + status).
5. E2E: submit → grade → lihat nilai.
6. Export: nilai assignment ke Excel (reuse `xlsx`) / PDF.

---

## 2. Public Landing Page (Untuk Portfolio)

### Tujuan

Saat ini `/` langsung redirect ke `/dashboard`. Landing page perlu untuk
memperkenalkan produk ke recruiter/klien portfolio.

### Scope

- **`/` — Hero + fitur** — headline, screenshot/demo, 3-4 fitur unggulan
  (AI lesson generator, absensi, import Excel, analytics).
- **Cara kerja** — 3 step: daftar → buat kelas → bagikan kode akses.
- **Login CTA** — ke `/login`; layout landing terpisah dari portal.
- **SEO** — metadata dinamis, Open Graph, `generateMetadata`.
- Multi-bahasa opsional (ID/EN) — skip dulu kecuali diminta.

### Pertimbangan Teknis

- Route `/` jadi halaman statis + `/dashboard` tetap entry portal
  (hilangkan double-hop redirect di `app/page.tsx`).
- Tanpa akses DB di landing (fast render, cacheable).
- Skema visual: ikuti design token yang ada (indigo accent, dark mode).

### Langkah Kerja

1. `app/page.tsx` → hero section + CTA.
2. Komponen `components/landing/*` (section, feature grid, footer).
3. `generateMetadata` + OG image.
4. Update README & screenshots.
5. E2E: anonim di `/` → landing tampil, klik login → `/login`.
