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

async function getClassAssignments(classId: string) {
  return db.assignment.findMany({
    where: {
      classes: { some: { classId } },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export default async function StudentAssignmentsPage() {
  const session = await auth()
  const assignments = await getClassAssignments(session!.user.classId!)

  function isDueSoon(dueDate: Date) {
    const diff = new Date(dueDate).getTime() - Date.now()
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
  }

  function isOverdue(dueDate: Date) {
    return new Date(dueDate).getTime() < Date.now()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          My Assignments
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Assignments for your class
        </p>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No assignments yet
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {assignment.description ?? '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.dueDate).toLocaleDateString(
                      undefined,
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    {isOverdue(assignment.dueDate) ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : isDueSoon(assignment.dueDate) ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                      >
                        Due Soon
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Upcoming
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
