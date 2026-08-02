import { requireStudent } from '@/lib/auth-helpers'
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
import { Paperclip } from 'lucide-react'

async function getClassAssignments(classId: string) {
  const assignments = await db.assignment.findMany({
    where: {
      classes: { some: { classId } },
    },
    include: { attachments: true },
    orderBy: { dueDate: 'asc' },
  })
  const now = new Date().getTime()

  return assignments.map((assignment) => {
    const diff = new Date(assignment.dueDate).getTime() - now
    return {
      ...assignment,
      isOverdue: diff < 0,
      isDueSoon: diff > 0 && diff < 1000 * 60 * 60 * 24 * 3,
    }
  })
}

export default async function StudentAssignmentsPage() {
  const session = await requireStudent()
  const assignments = await getClassAssignments(session.classId)

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
                <TableHead>Attachments</TableHead>
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
                    {assignment.isOverdue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : assignment.isDueSoon ? (
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
                  <TableCell>
                    {assignment.attachments.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="space-y-1">
                        {assignment.attachments.map((file) => (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-30">
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
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
