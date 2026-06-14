import { getClasses } from "@/lib/actions/class.actions"
import { AttendanceClient } from "@/components/attendance/attendance-client"
import { CalendarCheck } from "lucide-react"

export default async function AttendancePage() {
  const classes = await getClasses()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record daily attendance for your classes
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No classes yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a class first before recording attendance
          </p>
        </div>
      ) : (
        <AttendanceClient classes={classes} />
      )}
    </div>
  )
}