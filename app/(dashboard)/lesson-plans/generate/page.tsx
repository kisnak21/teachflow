import { getClasses } from '@/lib/actions/class.actions'
import { AILessonGenerator } from '@/components/lesson-plans/ai-lesson-generator'
import { Sparkles } from 'lucide-react'
import { getEnabledModels } from '@/lib/ai/providers'

export default async function GenerateLessonPlanPage() {
  const [classes, enabledModels] = await Promise.all([
    getClasses(),
    Promise.resolve(getEnabledModels()),
  ])

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            AI Lesson Generator
          </h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Buat RPP instan dengan AI — streaming, bisa diedit, ekspor PDF. Model
          otomatis round-robin dengan fallback.
        </p>
      </div>

      <AILessonGenerator classes={classes} enabledModels={enabledModels} />
    </div>
  )
}
