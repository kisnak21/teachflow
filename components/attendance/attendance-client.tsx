'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAttendance, saveAttendance } from '@/lib/actions/attendance.actions'
import { AttendanceStatus } from '@prisma/client'
import { getStudents } from '@/lib/actions/student.actions'
import { Checkbox } from '@/components/ui/checkbox'
import { generateAttendancePDF } from '@/lib/actions/pdf.actions'
import { Download } from 'lucide-react'

interface Props {
  classes: { id: string; name: string }[]
}

interface StudentAttendance {
  studentId: string
  name: string
  studentNumber: string
  status: AttendanceStatus
}

const statusOptions = [
  { value: AttendanceStatus.PRESENT, label: 'Present' },
  { value: AttendanceStatus.ABSENT, label: 'Absent' },
  { value: AttendanceStatus.LATE, label: 'Late' },
]

const statusColor = {
  PRESENT: 'text-green-600',
  ABSENT: 'text-red-600',
  LATE: 'text-yellow-600',
}

export function AttendanceClient({ classes }: Props) {
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<StudentAttendance[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleExportPDF() {
    if (!classId || !date) return
    setExporting(true)

    try {
      const base64 = await generateAttendancePDF(classId, date)
      const className = classes.find((c) => c.id === classId)?.name ?? 'class'

      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance-${className}-${date}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  async function handleLoad() {
    if (!classId || !date) return
    setLoading(true)
    setSaved(false)
    setSelected(new Set())

    const [students, existing] = await Promise.all([
      getStudents(classId),
      getAttendance(classId, date),
    ])

    const existingMap = new Map(existing.map((a) => [a.studentId, a.status]))

    setRecords(
      students.map((s) => ({
        studentId: s.id,
        name: s.name,
        studentNumber: s.studentNumber,
        status: existingMap.get(s.id) ?? AttendanceStatus.PRESENT,
      }))
    )

    setLoading(false)
  }

  async function handleSave() {
    if (!records.length) return
    setSaving(true)

    await saveAttendance(
      records.map((r) => ({
        studentId: r.studentId,
        classId,
        date,
        status: r.status,
      }))
    )

    setSaving(false)
    setSaved(true)
  }

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    )
  }

  function toggleSelect(studentId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === records.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(records.map((r) => r.studentId)))
    }
  }

  function bulkSetStatus(status: AttendanceStatus) {
    setRecords((prev) =>
      prev.map((r) => (selected.has(r.studentId) ? { ...r, status } : r))
    )
    setSelected(new Set())
  }

  const allSelected = records.length > 0 && selected.size === records.length
  const someSelected = selected.size > 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Select Class & Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
          />

          <Button onClick={handleLoad} disabled={!classId || loading}>
            {loading ? 'Loading...' : 'Load Students'}
          </Button>
        </CardContent>
      </Card>

      {records.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {classes.find((c) => c.id === classId)?.name} — {date}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Attendance'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Bulk actions */}
            <div className="flex items-center gap-3 pb-2 border-b">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </label>

              {someSelected && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-muted-foreground">
                    {selected.size} selected — mark as:
                  </span>
                  {statusOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => bulkSetStatus(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Student rows */}
            {records.map((record) => (
              <div
                key={record.studentId}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(record.studentId)}
                    onCheckedChange={() => toggleSelect(record.studentId)}
                  />
                  <div>
                    <p className="text-sm font-medium">{record.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.studentNumber}
                    </p>
                  </div>
                </div>
                <Select
                  value={record.status}
                  onValueChange={(val) =>
                    updateStatus(record.studentId, val as AttendanceStatus)
                  }
                >
                  <SelectTrigger
                    className={`w-32 ${statusColor[record.status]}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
