import { getStudents } from "@/lib/actions/student.actions"
import { getClasses } from "@/lib/actions/class.actions"
import { StudentTable } from "@/components/students/student-table"
import { CreateStudentDialog } from "@/components/students/create-student-dialog"
import { Users } from "lucide-react"

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    getStudents(),
    getClasses(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your students
          </p>
        </div>
        <CreateStudentDialog classes={classes} />
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No students yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first student to get started
          </p>
        </div>
      ) : (
        <StudentTable students={students} classes={classes} />
      )}
    </div>
  )
}