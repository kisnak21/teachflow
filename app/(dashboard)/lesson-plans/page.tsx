import { getLessonPlans } from "@/lib/actions/lesson-plan.actions"
import { getClasses } from "@/lib/actions/class.actions"
import { LessonPlanList } from "@/components/lesson-plans/lesson-plan-list"
import { CreateLessonPlanDialog } from "@/components/lesson-plans/create-lesson-plan-dialog"
import { FileText } from "lucide-react"

export default async function LessonPlansPage() {
  const [lessonPlans, classes] = await Promise.all([
    getLessonPlans(),
    getClasses(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Lesson Plans</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan and manage your lessons
          </p>
        </div>
        <CreateLessonPlanDialog classes={classes} />
      </div>

      {lessonPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No lesson plans yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first lesson plan to get started
          </p>
        </div>
      ) : (
        <LessonPlanList lessonPlans={lessonPlans} classes={classes} />
      )}
    </div>
  )
}