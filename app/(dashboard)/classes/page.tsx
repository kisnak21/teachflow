import { getClasses } from "@/lib/actions/class.actions"
import { ClassCard } from "@/components/classes/class-card"
import { CreateClassDialog } from "@/components/classes/create-class-dialog"
import { ClassFilter } from "@/components/classes/class-filter"
import { BookOpen } from "lucide-react"

interface Props {
  searchParams: Promise<{ level?: string }>
}

export default async function ClassesPage({ searchParams }: Props) {
  const { level } = await searchParams
  const classes = await getClasses()

  const levels = [...new Set(classes.map((c) => c.level).filter(Boolean))] as string[]

  const filtered = level
    ? classes.filter((c) => c.level === level)
    : classes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Classes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your classes
          </p>
        </div>
        <CreateClassDialog />
      </div>

      {levels.length > 0 && (
        <ClassFilter levels={levels} selectedLevel={level} />
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">No classes found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {level ? "No classes at this level" : "Create your first class to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  )
}