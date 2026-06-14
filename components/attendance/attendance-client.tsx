"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAttendance, saveAttendance } from "@/lib/actions/attendance.actions"
import { AttendanceStatus } from "@prisma/client"
import { getStudents } from "@/lib/actions/student.actions"

interface Props {
  classes: { id: string; name: string }[]
}

interface StudentAttendance {
  studentId: string
  name: string
  studentNumber: string
  status: AttendanceStatus
}

export function AttendanceClient({ classes }: Props) {
  const [classId, setClassId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [records, setRecords] = useState<StudentAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleLoad() {
    if (!classId || !date) return
    setLoading(true)
    setSaved(false)

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

  const statusOptions = [
    { value: AttendanceStatus.PRESENT, label: "Present" },
    { value: AttendanceStatus.ABSENT, label: "Absent" },
    { value: AttendanceStatus.LATE, label: "Late" },
  ]

  const statusColor = {
    PRESENT: "text-green-600",
    ABSENT: "text-red-600",
    LATE: "text-yellow-600",
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Select Class & Date</CardTitle>
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
            {loading ? "Loading..." : "Load Students"}
          </Button>
        </CardContent>
      </Card>

      {records.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {classes.find((c) => c.id === classId)?.name} — {date}
            </CardTitle>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Attendance"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.studentId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{record.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.studentNumber}
                    </p>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}