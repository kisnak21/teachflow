'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Download, Loader2, Paperclip, Pencil } from 'lucide-react'
import {
  getSubmissionOverview,
  gradeSubmission,
} from '@/lib/actions/submission.actions'

interface Submission {
  id: string
  fileUrl: string
  fileName: string
  note: string | null
  score: number | null
  feedback: string | null
  submittedAt: Date
  gradedAt: Date | null
}

interface OverviewRow {
  studentId: string
  name: string
  studentNumber: string
  className: string
  submission: Submission | null
}

interface Props {
  assignmentId: string
  assignmentTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function statusOf(submission: Submission | null) {
  if (!submission) return 'not-submitted'
  return submission.score === null ? 'submitted' : 'graded'
}

export function SubmissionsDialog({
  assignmentId,
  assignmentTitle,
  open,
  onOpenChange,
}: Props) {
  const [rows, setRows] = useState<OverviewRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [grading, setGrading] = useState<Submission | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)
  const [gradeError, setGradeError] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    getSubmissionOverview(assignmentId)
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load submissions'
          )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, assignmentId])

  function openGradeDialog(submission: Submission) {
    setGrading(submission)
    setScore(submission.score === null ? '' : String(submission.score))
    setFeedback(submission.feedback ?? '')
    setGradeError('')
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!grading) return
    setSavingGrade(true)
    setGradeError('')
    try {
      await gradeSubmission(grading.id, {
        score: Number(score),
        feedback: feedback.trim() || undefined,
      })
      setRows(
        (prev) =>
          prev?.map((r) =>
            r.submission?.id === grading.id
              ? {
                  ...r,
                  submission: {
                    ...r.submission,
                    score: Number(score),
                    feedback: feedback.trim() || null,
                    gradedAt: new Date(),
                  },
                }
              : r
          ) ?? null
      )
      setGrading(null)
    } catch (err: unknown) {
      setGradeError(err instanceof Error ? err.message : 'Failed to save grade')
    } finally {
      setSavingGrade(false)
    }
  }

  function handleExport() {
    if (!rows) return
    const data = rows.map((r) => ({
      Student: r.name,
      'Student Number': r.studentNumber,
      Class: r.className,
      Status:
        statusOf(r.submission) === 'graded'
          ? 'Graded'
          : statusOf(r.submission) === 'submitted'
            ? 'Submitted'
            : 'Not submitted',
      Score: r.submission?.score ?? '',
      Submitted: r.submission
        ? new Date(r.submission.submittedAt).toLocaleString()
        : '',
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 8 },
      { wch: 20 },
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions')
    const safeTitle = assignmentTitle.replace(/[\\/:*?"<>|]/g, '-')
    XLSX.writeFile(workbook, `submissions-${safeTitle}.xlsx`)
  }

  const gradedCount = rows?.filter(
    (r) => statusOf(r.submission) === 'graded'
  ).length
  const submittedCount = rows?.filter(
    (r) => statusOf(r.submission) === 'submitted'
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions — {assignmentTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {rows && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{rows.length} students</Badge>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    {submittedCount ?? 0} submitted
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    {gradedCount ?? 0} graded
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const status = statusOf(row.submission)
                      return (
                        <TableRow key={row.studentId}>
                          <TableCell className="font-medium">
                            {row.name}
                          </TableCell>
                          <TableCell>{row.studentNumber}</TableCell>
                          <TableCell>{row.className}</TableCell>
                          <TableCell>
                            {status === 'graded' ? (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                Graded
                              </Badge>
                            ) : status === 'submitted' ? (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-600"
                              >
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Not submitted</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.submission?.score !== null
                              ? `${row.submission?.score ?? '—'}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {row.submission && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={row.submission.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-muted-foreground hover:text-primary"
                                  title={row.submission.fileName}
                                >
                                  <Paperclip className="h-4 w-4" />
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    openGradeDialog(row.submission!)
                                  }
                                  title={
                                    row.submission.score === null
                                      ? 'Grade'
                                      : 'Edit grade'
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {grading && (
        <Dialog open onOpenChange={(open) => !open && setGrading(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grade submission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGrade} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>File</Label>
                <a
                  href={grading.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  {grading.fileName}
                </a>
              </div>
              {grading.note && (
                <div className="space-y-1">
                  <Label>Student note</Label>
                  <p className="text-sm text-muted-foreground">
                    {grading.note}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="grade-score">Score (0–100)</Label>
                <Input
                  id="grade-score"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade-feedback">Feedback</Label>
                <Textarea
                  id="grade-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback for the student..."
                  rows={3}
                />
              </div>
              {gradeError && (
                <p className="text-sm text-destructive">{gradeError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGrading(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingGrade}>
                  {savingGrade ? 'Saving...' : 'Save grade'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
