export type AICurriculum = 'merdeka' | 'k13' | 'umum'
export type AILanguage = 'id' | 'en'

export interface BuildPromptInput {
  subject: string
  topic: string
  grade: string
  duration: string
  curriculum?: AICurriculum
  language?: AILanguage
  method?: string
}

const SECTION_MARKERS = [
  '[TITLE]',
  '[OBJECTIVES]',
  '[ACTIVITIES]',
  '[ASSESSMENT]',
  '[HOMEWORK]',
  '[MATERIALS]',
  '[METHODS]',
  '[DIFFERENTIATION]',
] as const

export function buildLessonPrompt(input: BuildPromptInput): string {
  const curriculum = input.curriculum ?? 'umum'
  const language = input.language ?? 'id'
  const method = input.method?.trim()

  const langInstruction =
    language === 'id'
      ? 'Tulis SELURUH output dalam Bahasa Indonesia.'
      : 'Write the ENTIRE output in English.'

  const curriculumHint =
    curriculum === 'merdeka'
      ? '- Kurikulum: Kurikulum Merdeka — selaraskan dengan Capaian Pembelajaran (CP) / Tujuan Pembelajaran (TP) / Alur Tujuan Pembelajaran (ATP) yang relevan bila memungkinkan. Tekankan pembelajaran berdiferensiasi dan Profil Pelajar Pancasila.'
      : curriculum === 'k13'
        ? '- Kurikulum: K-13 — selaraskan dengan Kompetensi Inti/Kompetensi Dasar (KI/KD) yang relevan.'
        : '- Kurikulum: umum — tidak perlu menyebut kurikulum spesifik.'

  const methodHint = method
    ? `- Metode/pendekatan yang diinginkan guru: ${method}. Sesuaikan aktivitas dan asesmen dengan metode ini.`
    : ''

  return `Kamu adalah guru berpengalaman yang membuat RPP (Rencana Pelaksanaan Pembelajaran) yang dikalibrasi untuk jenjang yang diberikan.

Detail pelajaran:
- Mata pelajaran: ${input.subject}
- Topik: ${input.topic}
- Jenjang/kelas: ${input.grade}
- Durasi: ${input.duration}
${curriculumHint}
${methodHint}

KALIBRASI KRITIS untuk jenjang "${input.grade}":
- Kelas awal (Kelas 1-3 SD): kosakata sederhana, kalimat pendek, aktivitas konkret & hands-on, pacing pendek. Hindari konsep abstrak.
- Kelas atas SD (Kelas 4-6): seimbang konkret & sedikit abstrak, kerja mandiri terbimbing.
- SMP (Kelas 7-9): lebih banyak problem-solving mandiri & kerja kelompok.
- SMA/SMK (Kelas 10-12 / XI RPL dst): tugas analitis, penerapan dunia nyata, asesmen menguji pemahaman mendalam.
- Sesuaikan istilah, contoh, dan kompleksitas bahasa agar sesuai usia "${input.grade}" — jangan generik.

${langInstruction}

TUGAS OUTPUT — patuhi FORMAT MARKER di bawah ini secara ketat.
Aturan:
- Mulai setiap bagian dengan marker pada barisnya sendiri, persis seperti tertulis (termasuk kurung siku).
- Di bawah setiap marker, tulis konten bagian tersebut. Tiap poin pakai "- " di awal baris.
- Jangan tambah marker lain. Jangan pakai JSON. Jangan bungkus dengan \`\`\`.
- Untuk [TITLE], tulis satu baris judul saja (tanpa "- ").
- Semua bagian wajib diisi (minimal 2 poin, kecuali TITLE 1 baris).

FORMAT WAJIB:

${SECTION_MARKERS[0]}
(judul satu baris)

${SECTION_MARKERS[1]}
- ...
- ...

${SECTION_MARKERS[2]}
- ...
- ...

${SECTION_MARKERS[3]}
- ...
- ...

${SECTION_MARKERS[4]}
- ...
- ...

${SECTION_MARKERS[5]}
- ...
- ...

${SECTION_MARKERS[6]}
- ...
- ...

${SECTION_MARKERS[7]}
- ...
- ...

Marker yang harus dipakai (urutan ini): ${SECTION_MARKERS.join(' ')}
`
}

export const MARKERS = SECTION_MARKERS
