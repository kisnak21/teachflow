import { describe, it, expect } from 'vitest'
import { buildLessonPrompt, MARKERS } from '@/lib/ai/prompt'

const base = {
  subject: 'Pengembangan Web',
  topic: 'HTML Forms',
  grade: 'XI RPL',
  duration: '90 Menit',
}

describe('buildLessonPrompt', () => {
  it('contains all 8 markers in order', () => {
    const prompt = buildLessonPrompt(base)
    for (const m of MARKERS) {
      expect(prompt).toContain(m)
    }
    // order: TITLE before OBJECTIVES etc.
    const indices = MARKERS.map((m) => prompt.indexOf(m))
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1])
    }
  })

  it('embeds subject, topic, grade, duration', () => {
    const prompt = buildLessonPrompt(base)
    expect(prompt).toContain('Pengembangan Web')
    expect(prompt).toContain('HTML Forms')
    expect(prompt).toContain('XI RPL')
    expect(prompt).toContain('90 Menit')
  })

  it('defaults curriculum to umum when not provided', () => {
    const prompt = buildLessonPrompt(base)
    expect(prompt).toContain('Kurikulum: umum')
  })

  it('includes merdeka hint for merdeka curriculum', () => {
    const prompt = buildLessonPrompt({ ...base, curriculum: 'merdeka' })
    expect(prompt).toContain('Kurikulum Merdeka')
    expect(prompt).toContain('Capaian Pembelajaran')
  })

  it('includes K-13 hint for k13 curriculum', () => {
    const prompt = buildLessonPrompt({ ...base, curriculum: 'k13' })
    expect(prompt).toContain('K-13')
    expect(prompt).toContain('Kompetensi Inti')
  })

  it('defaults language to id instruction', () => {
    const prompt = buildLessonPrompt(base)
    expect(prompt).toContain('Bahasa Indonesia')
  })

  it('uses English instruction for en', () => {
    const prompt = buildLessonPrompt({ ...base, language: 'en' })
    expect(prompt).toContain('ENTIRE output in English')
    expect(prompt).not.toContain('Bahasa Indonesia')
  })

  it('includes method hint when method provided', () => {
    const prompt = buildLessonPrompt({
      ...base,
      method: 'Project-Based Learning',
    })
    expect(prompt).toContain('Project-Based Learning')
    expect(prompt).toContain('Metode/pendekatan')
  })

  it('omits method hint when not provided', () => {
    const prompt = buildLessonPrompt(base)
    // should not contain the method line when empty
    expect(prompt).not.toContain('Metode/pendekatan yang diinginkan guru: ,')
    expect(prompt).not.toContain(
      'Metode/pendekatan yang diinginkan guru: undefined'
    )
  })

  it('trims method whitespace', () => {
    const prompt = buildLessonPrompt({ ...base, method: '  PBL  ' })
    expect(prompt).toContain('PBL')
  })

  it('contains kalibrasi jenjang for given grade', () => {
    const prompt = buildLessonPrompt({ ...base, grade: 'Kelas 1 SD' })
    expect(prompt).toContain('Kelas 1 SD')
    expect(prompt).toContain('KALIBRASI KRITIS')
  })

  it('exposes correct FORMAT with marker line for TITLE', () => {
    const prompt = buildLessonPrompt(base)
    // TITLE followed by (judul satu baris)
    expect(prompt).toContain('[TITLE]\n(judul satu baris)')
  })
})
