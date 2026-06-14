import { getStudents } from "@/lib/actions/student.actions"
import { getClasses } from "@/lib/actions/class.actions"
import { StudentTable } from "@/components/students/student-table"
import { CreateStudentDialog } from "@/components/students/create-student-dialog"
import { StudentFilter } from "@/components/students/student-filter"
import { Users } from "lucide-react"

interface Props {
  searchParams: Promise<{ classId?: string }>
}

export default async function StudentsPage({ searchParams }: Props) {
  const { classId } = await searchParams

  const [students, classes] = await Promise.all([
    getStudents(classId),
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

      <StudentFilter classes={classes} selectedClassId={classId} />

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No students found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {classId ? "No students in this class yet" : "Add your first student to get started"}
          </p>
        </div>
      ) : (
        <StudentTable students={students} classes={classes} />
      )}
    </div>
  )
}