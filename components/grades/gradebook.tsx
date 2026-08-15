'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateAssessmentDialog } from './create-assessment-dialog'
import { EditAssessmentDialog } from './edit-assessment-dialog'
import {
  deleteAssessment,
  saveAssessmentGrade,
} from '@/lib/actions/assessment.actions'
import {
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Assessment = {
  id: string
  title: string
  type: string
  maxScore: number
  weight: number | null
  date: Date | string | null
}
type Student = { id: string; name: string; studentNumber: string }
type Grade = {
  assessmentId: string
  studentId: string
  score: number | null
  note: string | null
}

interface Props {
  classes: { id: string; name: string; level: string | null }[]
  initial: {
    cls: { id: string; name: string; level: string | null }
    students: Student[]
    assessments: Assessment[]
    grades: Grade[]
  }
  selectedClassId: string
}

function computeAverage(
  studentId: string,
  assessments: Assessment[],
  gradeMap: Map<string, Grade>
): number | null {
  const scores: { pct: number; weight?: number }[] = []
  let totalWeight = 0
  for (const a of assessments) {
    const g = gradeMap.get(`${a.id}:${studentId}`)
    if (g?.score !== null && g?.score !== undefined) {
      const pct = (g.score / a.maxScore) * 100
      if (a.weight !== null) {
        scores.push({ pct, weight: a.weight })
        totalWeight += a.weight
      } else {
        scores.push({ pct })
      }
    }
  }
  if (scores.length === 0) return null
  const hasWeighted = assessments.some((a) => a.weight !== null)
  if (hasWeighted && totalWeight === 100) {
    let sum = 0
    for (const s of scores) sum += s.pct * ((s.weight ?? 0) / 100)
    // for assessments without weight in mixed mode, distribute remainder? Simplistic: weighted sum already
    // If some assessments have no weight, they were pushed without weight — ignore for weighted calc, fallback to simple
    const weightedCount = scores.filter((s) => s.weight !== undefined).length
    if (
      weightedCount ===
      assessments.filter((a) => gradeMap.has(`${a.id}:${studentId}`)).length
    )
      return Math.round(sum * 10) / 10
  }
  // simple mean
  const sum = scores.reduce((acc, s) => acc + s.pct, 0)
  return Math.round((sum / scores.length) * 10) / 10
}

function ScoreCell({
  assessment,
  studentId,
  grade,
  onSave,
}: {
  assessment: Assessment
  studentId: string
  grade: Grade | undefined
  onSave: (score: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(
    grade?.score !== null && grade?.score !== undefined
      ? String(grade.score)
      : ''
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmed = value.trim()
    const score = trimmed === '' ? null : Number(trimmed)
    if (
      score !== null &&
      (Number.isNaN(score) || score < 0 || score > assessment.maxScore)
    )
      return
    setSaving(true)
    try {
      await onSave(score)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    const hasScore = grade?.score !== null && grade?.score !== undefined
    const pct = hasScore ? (grade!.score! / assessment.maxScore) * 100 : null
    return (
      <button
        onClick={() => {
          setValue(hasScore ? String(grade!.score) : '')
          setEditing(true)
        }}
        className={`w-full rounded px-2 py-1.5 text-center text-sm tabular-nums transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring ${pct === null ? 'text-muted-foreground' : pct >= 75 ? 'text-green-600 font-medium' : pct >= 50 ? 'text-amber-600' : 'text-destructive'}`}
      >
        {hasScore ? grade!.score : '–'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
        onBlur={handleSave}
        placeholder="–"
        className="h-7 text-center text-sm"
        type="number"
        min={0}
        max={assessment.maxScore}
        autoFocus
        disabled={saving}
      />
    </div>
  )
}

export function Gradebook({ classes, initial, selectedClassId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editAssessment, setEditAssessment] = useState<Assessment | null>(null)
  const [error, setError] = useState('')

  const gradeMap = useMemo(() => {
    const m = new Map<string, Grade>()
    for (const g of initial.grades) m.set(`${g.assessmentId}:${g.studentId}`, g)
    return m
  }, [initial.grades])

  function handleClassChange(classId: string) {
    startTransition(() => router.push(`/grades?classId=${classId}`))
  }

  async function handleDeleteAssessment(id: string, title: string) {
    if (!confirm(`Hapus assessment "${title}" beserta semua nilainya?`)) return
    setError('')
    try {
      await deleteAssessment(id)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete assessment'
      )
    }
  }

  async function handleSaveGrade(
    assessmentId: string,
    studentId: string,
    score: number | null
  ) {
    try {
      await saveAssessmentGrade({ assessmentId, studentId, score })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save grade')
    }
  }

  async function handleExportExcel() {
    const XLSX = await import('xlsx')
    const rows = initial.students.map((s) => {
      const avg = computeAverage(s.id, initial.assessments, gradeMap)
      const row: Record<string, string | number> = {
        Nama: s.name,
        'No. Siswa': s.studentNumber,
      }
      for (const a of initial.assessments) {
        const g = gradeMap.get(`${a.id}:${s.id}`)
        row[`${a.title} (/${a.maxScore})`] = g?.score ?? '–'
      }
      row['Rata-rata'] = avg ?? '–'
      return row
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Gradebook')
    XLSX.writeFile(
      wb,
      `gradebook-${initial.cls.name}-${new Date().toISOString().slice(0, 10)}.xlsx`
    )
  }

  async function handleExportPdf() {
    setError('')
    try {
      const { generateGradebookPDF } = await import('@/lib/actions/pdf.actions')
      const base64 = await generateGradebookPDF(selectedClassId)
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${base64}`
      link.download = `gradebook-${initial.cls.name}-${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF')
    }
  }

  const hasWeighted = initial.assessments.some((a) => a.weight !== null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.level ? `— ${c.level}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {initial.students.length} siswa • {initial.assessments.length}{' '}
            assessment
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {initial.assessments.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-1.5" /> PDF
              </Button>
            </>
          )}
          <CreateAssessmentDialog classId={selectedClassId} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {initial.assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm font-medium">Belum ada assessment</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Tambahkan assessment (Ulangan, UTS, Tugas, dll) untuk mulai
              mengisi nilai siswa.
            </p>
          </CardContent>
        </Card>
      ) : initial.students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm font-medium">Belum ada siswa di kelas ini</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tambahkan siswa di halaman Students terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px] sticky left-0 bg-card z-10">
                    Siswa
                  </TableHead>
                  {initial.assessments.map((a) => (
                    <TableHead key={a.id} className="text-center min-w-[110px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className="truncate max-w-[100px]"
                          title={a.title}
                        >
                          {a.title}
                        </span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {a.type} • /{a.maxScore}{' '}
                          {a.weight !== null ? `• ${a.weight}%` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditAssessment(a)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditAssessment(a)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteAssessment(a.id, a.title)
                              }
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[90px] bg-muted/50">
                    Rata-rata {hasWeighted ? '*' : ''}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initial.students.map((s) => {
                  const avg = computeAverage(
                    s.id,
                    initial.assessments,
                    gradeMap
                  )
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="sticky left-0 bg-card z-10">
                        <div className="font-medium text-sm truncate max-w-[200px]">
                          {s.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.studentNumber}
                        </div>
                      </TableCell>
                      {initial.assessments.map((a) => (
                        <TableCell key={a.id} className="p-1">
                          <ScoreCell
                            assessment={a}
                            studentId={s.id}
                            grade={gradeMap.get(`${a.id}:${s.id}`)}
                            onSave={(score) =>
                              handleSaveGrade(a.id, s.id, score)
                            }
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold tabular-nums bg-muted/30">
                        <span
                          className={
                            avg === null
                              ? 'text-muted-foreground'
                              : avg >= 75
                                ? 'text-green-600'
                                : avg >= 50
                                  ? 'text-amber-600'
                                  : 'text-destructive'
                          }
                        >
                          {avg === null ? '–' : avg.toFixed(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {hasWeighted && (
            <p className="px-4 py-2 text-xs text-muted-foreground">
              * Rata-rata terbobot bila total bobot = 100%, sonst rata-rata
              sederhana (skor dinormalisasi ke skala 0–100).
            </p>
          )}
        </Card>
      )}

      {editAssessment && (
        <EditAssessmentDialog
          assessment={editAssessment}
          open={!!editAssessment}
          onOpenChange={(open) => !open && setEditAssessment(null)}
        />
      )}
    </div>
  )
}
