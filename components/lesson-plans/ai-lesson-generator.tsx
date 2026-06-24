"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Save, Loader2, RotateCcw } from "lucide-react"
import { generateLessonPlan, GeneratedLessonPlan } from "@/lib/actions/ai.actions"
import { createLessonPlan } from "@/lib/actions/lesson-plan.actions"
import { useRouter } from "next/navigation"

interface Props {
  classes: { id: string; name: string }[]
}

const emptyForm = {
  subject: "",
  topic: "",
  grade: "",
  duration: "",
}

export function AILessonGenerator({ classes }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [classId, setClassId] = useState("")
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<GeneratedLessonPlan | null>(null)

  async function runGenerate() {
    setError("")
    try {
      const generated = await generateLessonPlan(form)
      setResult(generated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    await runGenerate()
    setLoading(false)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    await runGenerate()
    setRegenerating(false)
  }

  async function handleSave() {
    if (!result || !classId) {
      setError("Please select a class before saving")
      return
    }

    setSaving(true)
    setError("")

    try {
      await createLessonPlan({
        title: result.title,
        subject: form.subject,
        objectives: result.objectives.join("\n"),
        activities: result.activities.join("\n"),
        assessment: result.assessment.join("\n"),
        notes: result.homework.join("\n"),
        classId,
      })
      router.push("/lesson-plans")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Lesson Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Web Development"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g. HTML Forms"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  placeholder="e.g. XI RPL or Primary 2"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 90 Minutes"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Lesson Plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">{result.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                disabled={regenerating || loading}
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Learning Objectives
              </p>
              <ul className="space-y-1">
                {result.objectives.map((obj, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {i + 1}.
                    </span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Activities
              </p>
              <ul className="space-y-1">
                {result.activities.map((act, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {i + 1}.
                    </span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Assessment Ideas
              </p>
              <ul className="space-y-1">
                {result.assessment.map((a, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {i + 1}.
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Homework Ideas
              </p>
              <ul className="space-y-1">
                {result.homework.map((hw, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {i + 1}.
                    </span>
                    {hw}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}