# TeachFlow — Planned Features

> Status: Fitur 1 **sedang dikerjakan** (dimulai 2026-08-11, scope final s.d.
> bawah). Fitur 2 masih **proposed** — dibahas setelah fitur 1 selesai.

---

## 1. Student Submission & Grading (Nilai Portfolio Tinggi)

### Latar Belakang

Saat ini portal siswa _read-only_. Siswa bisa login, lihat dashboard, riwayat
absensi, dan assignment, tapi belum bisa mengumpulkan tugas, dan guru belum
bisa menilai. README mencatat ini sebagai deferred.

### Scope (FINAL — disepakati 2026-08-11)

| Poin               | Keputusan                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| Skala nilai        | Skor 0–100 + feedback (satu angka, bukan per-kriteria)                                 |
| Jenis pengumpulan  | File (PDF/gambar/Word via Uploadthing) **+ catatan teks opsional**                     |
| Revisi             | Timpa (1 submission per student per assignment, `@@unique([studentId, assignmentId])`) |
| Tampilan guru      | Dialog "Submissions" di halaman assignment (tabel siswa + status + modal nilai)        |
| Deadline           | Tidak memblokir upload; status assignment menampilkan keterlambatan via dueDate        |
| Email saat dinilai | **Ditunda** (opsional fase 2 — infrastructure Resend sudah ada)                        |
| Ekspor nilai       | Tombol export Excel di dialog guru (reuse `xlsx`)                                      |
| Analytics          | Ditunda (fase 2) — tidak membesarkan scope MVP                                         |

Status submission: `not-submitted | submitted | graded`.

### Pertimbangan Keamanan (standar proyek ini)

- `requireStudent()` + verifikasi `assignmentId` milik kelas siswa.
- `requireTeacher()` + ownership check assignment sebelum grade.
- Hanya file pembuat submission yang bisa dihapus/diubah.
- Halaman ungraded submission tidak boleh menampilkan submission kelas lain
  (cek `classId` lewat `AssignmentClass`).
- Revisi (resubmit) menghapus file lama di Uploadthing dan me-reset
  `score/feedback` (harus dinilai ulang oleh guru).

### Skema Prisma (draft)

```prisma
model Submission {
  id           String     @id @default(cuid())
  studentId    String
  assignmentId String
  fileUrl      String
  fileName     String
  note         String?
  score        Int?       // null = belum dinilai
  feedback     String?
  submittedAt  DateTime   @default(now())
  gradedAt     DateTime?
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@unique([studentId, assignmentId])
}
```

### Langkah Kerja (urutan commit)

1. [x] Update scope final di `PLANNED.md` (commit ini).
2. [ ] Migration `add_submission` + relasi di `Assignment`.
3. [ ] `lib/actions/submission.actions.ts` (submit, delete, grade, overview).
4. [ ] Uploadthing router baru `submissionUploader` (guru & siswa, file count 1/task).
5. [ ] UI guru: dialog "Submissions" + modal grading + export Excel.
6. [ ] UI siswa: submit/status/nilai di halaman assignment.
7. [ ] E2E: submit → grade → lihat nilai.

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
