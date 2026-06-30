import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getStudentAttendance(studentId: string) {
  return db.attendance.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  })
}

export default async function StudentAttendancePage() {
  const session = await auth()
  const records = await getStudentAttendance(session!.user.id)

  const presentCount = records.filter((r) => r.status === 'PRESENT').length
  const absentCount = records.filter((r) => r.status === 'ABSENT').length
  const lateCount = records.filter((r) => r.status === 'LATE').length
  const rate =
    records.length > 0
      ? Math.round((presentCount / records.length) * 100)
      : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your full attendance history
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rate !== null ? `${rate}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No attendance records yet
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {record.status === 'PRESENT' ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Present
                      </Badge>
                    ) : record.status === 'ABSENT' ? (
                      <Badge variant="destructive">Absent</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                      >
                        Late
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
