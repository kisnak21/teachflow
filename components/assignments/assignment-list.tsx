'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Paperclip } from 'lucide-react'
import { deleteAssignment } from '@/lib/actions/assignment.actions'
import { EditAssignmentDialog } from './edit-assignment-dialog'

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: Date
  status: 'overdue' | 'dueSoon' | 'upcoming'
  classes: {
    classId: string
    class: { id: string; name: string }
  }[]
  attachments: { id: string; name: string; url: string }[]
}

interface Props {
  assignments: Assignment[]
  classes: { id: string; name: string }[]
}

export function AssignmentList({ assignments, classes }: Props) {
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteAssignment(id)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{assignment.title}</span>
                    {assignment.attachments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditAssignment(assignment)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        title={`${assignment.attachments.length} attachment(s) — click to view`}
                      >
                        <Paperclip className="h-3 w-3" />
                        {assignment.attachments.length}
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {assignment.classes.map((ac) => (
                      <Badge key={ac.classId} variant="secondary">
                        {ac.class.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {assignment.status === 'overdue' ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : assignment.status === 'dueSoon' ? (
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditAssignment(assignment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() =>
                        handleDelete(assignment.id, assignment.title)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editAssignment && (
        <EditAssignmentDialog
          assignment={editAssignment}
          classes={classes}
          open={!!editAssignment}
          onOpenChange={(open) => !open && setEditAssignment(null)}
        />
      )}
    </>
  )
}
