import { getAssignments } from "@/lib/actions/assignment.actions"
import { getClasses } from "@/lib/actions/class.actions"
import { AssignmentList } from "@/components/assignments/assignment-list"
import { CreateAssignmentDialog } from "@/components/assignments/create-assignment-dialog"
import { ClipboardList } from "lucide-react"

export default async function AssignmentsPage() {
  const [assignments, classes] = await Promise.all([
    getAssignments(),
    getClasses(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Assignments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your assignments
          </p>
        </div>
        <CreateAssignmentDialog classes={classes} />
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No assignments yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first assignment to get started
          </p>
        </div>
      ) : (
        <AssignmentList assignments={assignments} classes={classes} />
      )}
    </div>
  )
}