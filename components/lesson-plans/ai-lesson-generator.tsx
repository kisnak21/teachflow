'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Save,
  Loader2,
  RotateCcw,
  Copy,
  FileDown,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { createLessonPlan } from '@/lib/actions/lesson-plan.actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { GeneratedLessonPlan } from '@/lib/ai/parse'

interface Props {
  classes: { id: string; name: string }[]
  enabledModels: { id: string; label: string; provider: string }[]
}

type Curriculum = 'merdeka' | 'k13' | 'umum'
type Language = 'id' | 'en'

const SECTION_ORDER = [
  '[TITLE]',
  '[OBJECTIVES]',
  '[ACTIVITIES]',
  '[ASSESSMENT]',
  '[HOMEWORK]',
  '[MATERIALS]',
  '[METHODS]',
  '[DIFFERENTIATION]',
] as const

const SECTION_LABELS: Record<string, string> = {
  '[TITLE]': 'Judul',
  '[OBJECTIVES]': 'Tujuan Pembelajaran',
  '[ACTIVITIES]': 'Kegiatan',
  '[ASSESSMENT]': 'Asesmen',
  '[HOMEWORK]': 'Tugas / PR',
  '[MATERIALS]': 'Materi & Media',
  '[METHODS]': 'Metode',
  '[DIFFERENTIATION]': 'Diferensiasi',
}

function sectionKey(marker: string): keyof GeneratedLessonPlan {
  switch (marker) {
    case '[TITLE]':
      return 'title' as unknown as keyof GeneratedLessonPlan
    case '[OBJECTIVES]':
      return 'objectives'
    case '[ACTIVITIES]':
      return 'activities'
    case '[ASSESSMENT]':
      return 'assessment'
    case '[HOMEWORK]':
      return 'homework'
    case '[MATERIALS]':
      return 'materials'
    case '[METHODS]':
      return 'methods'
    case '[DIFFERENTIATION]':
      return 'differentiation'
    default:
      return 'title' as unknown as keyof GeneratedLessonPlan
  }
}

export function AILessonGenerator({ classes, enabledModels }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    grade: '',
    duration: '',
    curriculum: 'umum' as Curriculum,
    language: 'id' as Language,
    method: '',
    classId: '',
    modelChoice: 'auto',
  })

  const [streaming, setStreaming] = useState(false)
  const [streamMeta, setStreamMeta] = useState<{
    model: string
    provider: string
    label: string
  } | null>(null)
  const [sections, setSections] = useState<Record<string, string>>({})
  const [partial, setPartial] = useState<{
    marker: string
    text: string
  } | null>(null)
  const [fallbacks, setFallbacks] = useState<string[]>([])
  const [error, setError] = useState('')
  const [result, setResult] = useState<GeneratedLessonPlan | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const hasClasses = classes.length > 0
  const hasModels = enabledModels.length > 0

  async function runGenerate(isRegenerate = false) {
    if (!form.classId) {
      setError('Pilih kelas terlebih dahulu')
      return
    }
    if (!hasModels) {
      setError('Tidak ada model AI yang dikonfigurasi')
      return
    }

    setError('')
    if (!isRegenerate) {
      setResult(null)
    }
    setSections({})
    setPartial(null)
    setFallbacks([])
    setStreamMeta(null)
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const isAuto = form.modelChoice === 'auto'
    const body = {
      subject: form.subject,
      topic: form.topic,
      grade: form.grade,
      duration: form.duration,
      curriculum: form.curriculum,
      language: form.language,
      method: form.method || undefined,
      modelId: isAuto ? undefined : form.modelChoice,
      strategy: isAuto ? ('round-robin' as const) : ('manual' as const),
      allowFallback: true,
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (
        !res.ok &&
        res.headers.get('content-type')?.includes('application/json')
      ) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error ?? `Request failed: ${res.status}`)
      }
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let donePlan: GeneratedLessonPlan | null = null
      const localSections: Record<string, string> = {}

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE frames are separated by \n\n
        const frames = buffer.split('\n\n')
        // keep last incomplete frame in buffer
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          if (!frame.trim()) continue
          // frame may contain multiple lines: event: xxx\ndata: yyy
          const lines = frame.split('\n')
          let event = 'message'
          let dataStr = ''
          for (const line of lines) {
            if (line.startsWith('event:')) event = line.slice(6).trim()
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim()
          }
          if (!dataStr) continue
          let data: unknown
          try {
            data = JSON.parse(dataStr)
          } catch {
            continue
          }

          if (event === 'meta') {
            const d = data as { model: string; provider: string; label: string }
            setStreamMeta({
              model: d.model,
              provider: d.provider,
              label: d.label,
            })
          } else if (event === 'section') {
            const d = data as { marker: string; label: string; text: string }
            localSections[d.marker] = d.text
            setSections((prev) => ({ ...prev, [d.marker]: d.text }))
          } else if (event === 'delta') {
            const d = data as { marker: string; label: string; partial: string }
            setPartial({ marker: d.marker, text: d.partial })
          } else if (event === 'fallback') {
            const d = data as {
              from: string
              error: string
              next: string | null
            }
            setFallbacks((prev) => [
              ...prev,
              `${d.from} → ${d.next ?? '?'} (${d.error})`,
            ])
          } else if (event === 'done') {
            const d = data as {
              plan: GeneratedLessonPlan
              model: string
              provider: string
            }
            donePlan = d.plan
            // Ensure all sections are in state
            const mapped: Record<string, string> = {}
            mapped['[TITLE]'] = d.plan.title
            mapped['[OBJECTIVES]'] = d.plan.objectives.join('\n')
            mapped['[ACTIVITIES]'] = d.plan.activities.join('\n')
            mapped['[ASSESSMENT]'] = d.plan.assessment.join('\n')
            mapped['[HOMEWORK]'] = d.plan.homework.join('\n')
            mapped['[MATERIALS]'] = d.plan.materials.join('\n')
            mapped['[METHODS]'] = d.plan.methods.join('\n')
            mapped['[DIFFERENTIATION]'] = d.plan.differentiation.join('\n')
            setSections(mapped)
            setPartial(null)
          } else if (event === 'error') {
            const d = data as { message: string }
            throw new Error(d.message)
          }
        }
      }

      if (donePlan) {
        // Keep editable copy in result; sections already set
        setResult(donePlan)
      } else if (Object.keys(localSections).length > 0) {
        // Fallback: try to parse what we have even if done not received
        // Build a plan from localSections if possible
        try {
          const { parseStreamedSections } = await import('@/lib/ai/parse')
          // Reconstruct raw with markers for parser
          let raw = ''
          for (const m of SECTION_ORDER) {
            const txt = localSections[m]
            if (txt !== undefined) raw += `${m}\n${txt}\n\n`
          }
          const parsed = parseStreamedSections(raw)
          setResult(parsed)
        } catch {
          // keep sections as is for display even without full parse
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Gagal generate')
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await runGenerate(false)
  }

  async function handleRegenerate() {
    await runGenerate(true)
  }

  function handleStop() {
    abortRef.current?.abort()
    setStreaming(false)
  }

  async function handleSave() {
    if (!result) return
    if (!form.classId) {
      setError('Pilih kelas terlebih dahulu')
      return
    }
    setSaving(true)
    setError('')
    try {
      // Use edited sections if user modified them
      const title = sections['[TITLE]'] ?? result.title
      const objectives =
        sections['[OBJECTIVES]'] ?? result.objectives.join('\n')
      const activities =
        sections['[ACTIVITIES]'] ?? result.activities.join('\n')
      const assessment =
        sections['[ASSESSMENT]'] ?? result.assessment.join('\n')
      const homework = sections['[HOMEWORK]'] ?? result.homework.join('\n')
      const materials = sections['[MATERIALS]'] ?? result.materials.join('\n')
      const methods = sections['[METHODS]'] ?? result.methods.join('\n')
      const differentiation =
        sections['[DIFFERENTIATION]'] ?? result.differentiation.join('\n')

      await createLessonPlan({
        title,
        subject: form.subject,
        objectives,
        activities,
        assessment,
        notes: homework,
        materials,
        methods,
        differentiation,
        classId: form.classId,
      })
      router.push('/lesson-plans')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    const lines: string[] = []
    for (const m of SECTION_ORDER) {
      const label = SECTION_LABELS[m]
      const text = sections[m] ?? ''
      lines.push(`${label}:\n${text}\n`)
    }
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportPdf() {
    if (!result) return
    setExporting(true)
    try {
      const { generateLessonPlanPdfFromData } =
        await import('@/lib/actions/pdf.actions')
      const title = sections['[TITLE]'] ?? result.title
      const b64 = await generateLessonPlanPdfFromData({
        title,
        subject: form.subject,
        grade: form.grade,
        duration: form.duration,
        objectives: (sections['[OBJECTIVES]'] ?? result.objectives.join('\n'))
          .split('\n')
          .filter(Boolean),
        activities: (sections['[ACTIVITIES]'] ?? result.activities.join('\n'))
          .split('\n')
          .filter(Boolean),
        assessment: (sections['[ASSESSMENT]'] ?? result.assessment.join('\n'))
          .split('\n')
          .filter(Boolean),
        homework: (sections['[HOMEWORK]'] ?? result.homework.join('\n'))
          .split('\n')
          .filter(Boolean),
        materials: (sections['[MATERIALS]'] ?? result.materials.join('\n'))
          .split('\n')
          .filter(Boolean),
        methods: (sections['[METHODS]'] ?? result.methods.join('\n'))
          .split('\n')
          .filter(Boolean),
        differentiation: (
          sections['[DIFFERENTIATION]'] ?? result.differentiation.join('\n')
        )
          .split('\n')
          .filter(Boolean),
      })
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal ekspor PDF')
    } finally {
      setExporting(false)
    }
  }

  const displayedSections = result
    ? SECTION_ORDER.map((m) => ({
        marker: m,
        label: SECTION_LABELS[m],
        text: sections[m] ?? '',
      }))
    : SECTION_ORDER.map((m) => ({
        marker: m,
        label: SECTION_LABELS[m],
        text: sections[m] ?? '',
      }))

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Detail Pelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Mata Pelajaran</Label>
                <Input
                  id="subject"
                  placeholder="mis. Pengembangan Web"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                  disabled={streaming}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topik</Label>
                <Input
                  id="topic"
                  placeholder="mis. HTML Forms"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                  disabled={streaming}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Jenjang / Kelas</Label>
                <Input
                  id="grade"
                  placeholder="mis. XI RPL atau Kelas 5 SD"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  required
                  disabled={streaming}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi</Label>
                <Input
                  id="duration"
                  placeholder="mis. 90 Menit"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  required
                  disabled={streaming}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kurikulum</Label>
                <Select
                  value={form.curriculum}
                  onValueChange={(v) =>
                    setForm({ ...form, curriculum: v as Curriculum })
                  }
                  disabled={streaming}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum">Umum</SelectItem>
                    <SelectItem value="merdeka">Kurikulum Merdeka</SelectItem>
                    <SelectItem value="k13">K-13</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bahasa Output</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) =>
                    setForm({ ...form, language: v as Language })
                  }
                  disabled={streaming}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Metode (opsional)</Label>
              <Input
                id="method"
                placeholder="mis. Project-Based Learning"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                disabled={streaming}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kelas Tujuan</Label>
                {hasClasses ? (
                  <Select
                    value={form.classId}
                    onValueChange={(v) => setForm({ ...form, classId: v })}
                    disabled={streaming}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                    Belum ada kelas.{' '}
                    <Link href="/classes" className="text-primary underline">
                      Buat kelas
                    </Link>{' '}
                    dulu.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Model AI</Label>
                <Select
                  value={form.modelChoice}
                  onValueChange={(v) => setForm({ ...form, modelChoice: v })}
                  disabled={streaming || !hasModels}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        hasModels ? 'Pilih model' : 'Tidak ada model'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Otomatis (round-robin + fallback)
                    </SelectItem>
                    {enabledModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!hasClasses && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Buat minimal satu kelas supaya RPP bisa disimpan.
              </p>
            )}
            {!hasModels && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Tidak ada API key AI yang dikonfigurasi.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  streaming ||
                  !hasClasses ||
                  !form.subject ||
                  !form.topic ||
                  !form.grade ||
                  !form.duration
                }
                className="flex-1"
              >
                {streaming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghasilkan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate RPP
                  </>
                )}
              </Button>
              {streaming && (
                <Button type="button" variant="outline" onClick={handleStop}>
                  Stop
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Streaming / Result */}
      {(streaming || result || Object.keys(sections).length > 0) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-sm font-medium">
                {sections['[TITLE]'] || 'RPP (streaming...)'}
              </CardTitle>
              {streamMeta && (
                <p className="text-xs text-muted-foreground mt-1">
                  Model: {streamMeta.label}{' '}
                  {streaming ? '• streaming...' : '• selesai'}
                </p>
              )}
              {fallbacks.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Fallback: {fallbacks.join(' | ')}
                </p>
              )}
            </div>
            {result && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={streaming}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={streaming}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Tersalin' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportPdf}
                  disabled={exporting || streaming}
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || streaming}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Simpan
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedSections
              .filter((s) => s.marker !== '[TITLE]')
              .map((sec) => {
                const isActivePartial =
                  partial?.marker === sec.marker && streaming
                const displayText =
                  sec.text || (isActivePartial ? partial.text : '')
                const hasContent = !!displayText
                if (!hasContent && !streaming) return null
                if (
                  !hasContent &&
                  streaming &&
                  sec.marker !== partial?.marker
                ) {
                  // Not yet reached this section
                  return (
                    <div key={sec.marker} className="opacity-50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {sec.label}
                      </p>
                      <div className="h-8 bg-muted animate-pulse rounded" />
                    </div>
                  )
                }
                return (
                  <div key={sec.marker}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                      {sec.label}
                      {isActivePartial && (
                        <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </p>
                    {result ? (
                      <Textarea
                        value={displayText}
                        onChange={(e) =>
                          setSections((prev) => ({
                            ...prev,
                            [sec.marker]: e.target.value,
                          }))
                        }
                        rows={Math.max(2, displayText.split('\n').length + 1)}
                        className="text-sm"
                      />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap border rounded-md p-3 bg-muted/30 min-h-12">
                        {displayText || (streaming ? 'Menunggu...' : '—')}
                        {isActivePartial && (
                          <span className="animate-pulse">▌</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

            {result && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Judul (editable)
                </p>
                <Input
                  value={sections['[TITLE]'] ?? ''}
                  onChange={(e) =>
                    setSections((prev) => ({
                      ...prev,
                      ['[TITLE]']: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {streaming && !result && (
              <p className="text-xs text-muted-foreground">
                Streaming dari {streamMeta?.label ?? 'model'}...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
