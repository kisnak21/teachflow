"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { deleteAssignment } from "@/lib/actions/assignment.actions"
import { EditAssignmentDialog } from "./edit-assignment-dialog"

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: Date
  classes: {
    classId: string
    class: { id: string; name: string }
  }[]
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

  function isDueSoon(dueDate: Date) {
    const diff = new Date(dueDate).getTime() - Date.now()
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
  }

  function isOverdue(dueDate: Date) {
    return new Date(dueDate).getTime() < Date.now()
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
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.title}
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