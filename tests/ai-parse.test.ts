import { describe, it, expect } from 'vitest'
import { parseStreamedSections, splitBufferForSSE } from '@/lib/ai/parse'

function fullSample(overrides: Record<string, string> = {}) {
  const parts = {
    TITLE: 'Memahami HTML Forms',
    OBJECTIVES: '- Siswa memahami struktur form\n- Siswa mampu membuat input',
    ACTIVITIES: '- Pembukaan 10 menit\n- Inti 60 menit\n- Penutup 20 menit',
    ASSESSMENT: '- Kuis singkat\n- Presentasi kelompok',
    HOMEWORK: '- Buat form kontak sederhana',
    MATERIALS: '- Laptop\n- Projector',
    METHODS: '- Ceramah interaktif\n- Diskusi',
    DIFFERENTIATION:
      '- Pendampingan untuk pemula\n- Tantangan tambahan untuk mahir',
    ...overrides,
  }
  return `[TITLE]
${parts.TITLE}

[OBJECTIVES]
${parts.OBJECTIVES}

[ACTIVITIES]
${parts.ACTIVITIES}

[ASSESSMENT]
${parts.ASSESSMENT}

[HOMEWORK]
${parts.HOMEWORK}

[MATERIALS]
${parts.MATERIALS}

[METHODS]
${parts.METHODS}

[DIFFERENTIATION]
${parts.DIFFERENTIATION}
`
}

describe('parseStreamedSections', () => {
  it('parses full 8-section happy path', () => {
    const raw = fullSample()
    const parsed = parseStreamedSections(raw)
    expect(parsed.title).toBe('Memahami HTML Forms')
    expect(parsed.objectives).toEqual([
      'Siswa memahami struktur form',
      'Siswa mampu membuat input',
    ])
    expect(parsed.activities.length).toBe(3)
    expect(parsed.materials).toEqual(['Laptop', 'Projector'])
    expect(parsed.methods.length).toBe(2)
    expect(parsed.differentiation.length).toBe(2)
  })

  it('strips bullet markers and numbered prefixes', () => {
    const raw = fullSample({
      OBJECTIVES: '1. Pahami form\n2) Buat input\n• Validasi',
      ACTIVITIES: '- Kegiatan A\n• Kegiatan B',
    })
    const parsed = parseStreamedSections(raw)
    expect(parsed.objectives).toEqual(['Pahami form', 'Buat input', 'Validasi'])
    expect(parsed.activities).toEqual(['Kegiatan A', 'Kegiatan B'])
  })

  it('regression: markers not included as list items (index bug)', () => {
    // Previously marker line was counted as item because index included marker
    const raw = fullSample()
    const parsed = parseStreamedSections(raw)
    // No item should equal a marker string
    for (const arr of [
      parsed.objectives,
      parsed.activities,
      parsed.assessment,
    ]) {
      for (const item of arr) {
        expect(item).not.toMatch(/^\[.*\]$/)
      }
    }
  })

  it('keeps last occurrence on duplicate markers', () => {
    const raw = `[TITLE]
First Title

[OBJECTIVES]
- A

[TITLE]
Second Title

[OBJECTIVES]
- B

[ACTIVITIES]
- X

[ASSESSMENT]
- Y

[HOMEWORK]
- Z

[MATERIALS]
- M

[METHODS]
- N

[DIFFERENTIATION]
- D
`
    const parsed = parseStreamedSections(raw)
    expect(parsed.title).toBe('Second Title')
    expect(parsed.objectives).toEqual(['B'])
  })

  it('throws when no markers found', () => {
    expect(() => parseStreamedSections('hello world no markers')).toThrow(
      /No section markers/
    )
  })

  it('throws when TITLE missing', () => {
    const raw = `[OBJECTIVES]
- A

[ACTIVITIES]
- B

[ASSESSMENT]
- C

[HOMEWORK]
- D

[MATERIALS]
- E

[METHODS]
- F

[DIFFERENTIATION]
- G
`
    expect(() => parseStreamedSections(raw)).toThrow(/Missing \[TITLE\]/)
  })

  it('throws when a required section is empty', () => {
    const raw = fullSample({ ASSESSMENT: '' })
    // MATERIALS etc still present but ASSESSMENT empty => should throw
    expect(() => parseStreamedSections(raw)).toThrow(/ASSESSMENT/)
  })

  it('handles CRLF line endings', () => {
    const raw = fullSample().replace(/\n/g, '\r\n')
    const parsed = parseStreamedSections(raw)
    expect(parsed.title).toBe('Memahami HTML Forms')
    expect(parsed.objectives.length).toBe(2)
  })

  it('handles title with bullet prefix', () => {
    const raw = fullSample({ TITLE: '- Judul Dengan Bullet' })
    const parsed = parseStreamedSections(raw)
    expect(parsed.title).toBe('Judul Dengan Bullet')
  })

  it('ignores extra whitespace around markers', () => {
    const raw = fullSample()
      .replace('[TITLE]', '[TITLE]   ')
      .replace('[OBJECTIVES]', '[OBJECTIVES]  ')
    const parsed = parseStreamedSections(raw)
    expect(parsed.title).toBe('Memahami HTML Forms')
  })
})

describe('splitBufferForSSE', () => {
  it('splits completed vs partial correctly', () => {
    const buffer = `[TITLE]
Judul

[OBJECTIVES]
- A
- B

[ACTIVITIES]
- partial text here`
    const { completed, partialMarker, partialText } = splitBufferForSSE(buffer)
    expect(completed).toHaveLength(2)
    expect(completed[0].marker).toBe('[TITLE]')
    expect(completed[0].text).toBe('Judul')
    expect(completed[1].marker).toBe('[OBJECTIVES]')
    expect(partialMarker).toBe('[ACTIVITIES]')
    expect(partialText).toBe('- partial text here')
  })

  it('returns empty completed when only one marker present', () => {
    const { completed, partialMarker } = splitBufferForSSE('[TITLE]\nHello')
    expect(completed).toHaveLength(0)
    expect(partialMarker).toBe('[TITLE]')
  })

  it('returns empty when no markers', () => {
    const res = splitBufferForSSE('no markers yet')
    expect(res.completed).toHaveLength(0)
    expect(res.partialMarker).toBeNull()
    expect(res.partialText).toBe('no markers yet')
  })
})
