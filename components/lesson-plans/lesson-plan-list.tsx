"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { deleteLessonPlan } from "@/lib/actions/lesson-plan.actions"
import { EditLessonPlanDialog } from "./edit-lesson-plan-dialog"

interface LessonPlan {
  id: string
  title: string
  subject: string
  objectives: string
  activities: string
  assessment: string | null
  notes: string | null
  classId: string
  class: { id: string; name: string }
}

interface Props {
  lessonPlans: LessonPlan[]
  classes: { id: string; name: string }[]
}

export function LessonPlanList({ lessonPlans, classes }: Props) {
  const [editPlan, setEditPlan] = useState<LessonPlan | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteLessonPlan(id)
  }

  return (
    <>
      <div className="space-y-3">
        {lessonPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <Badge variant="outline">{plan.subject}</Badge>
                  <Badge variant="secondary">{plan.class.name}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setExpanded(expanded === plan.id ? null : plan.id)
                    }
                  >
                    {expanded === plan.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditPlan(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(plan.id, plan.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expanded === plan.id && (
              <CardContent className="space-y-3 pt-0">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Objectives
                  </p>
                  <p className="text-sm">{plan.objectives || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Activities
                  </p>
                  <p className="text-sm">{plan.activities || "—"}</p>
                </div>
                {plan.assessment && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Assessment
                    </p>
                    <p className="text-sm">{plan.assessment}</p>
                  </div>
                )}
                {plan.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Notes
                    </p>
                    <p className="text-sm">{plan.notes}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {editPlan && (
        <EditLessonPlanDialog
          plan={editPlan}
          classes={classes}
          open={!!editPlan}
          onOpenChange={(open) => !open && setEditPlan(null)}
        />
      )}
    </>
  )
}