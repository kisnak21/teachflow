"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateLessonPlan } from "@/lib/actions/lesson-plan.actions"
import { UploadButton } from "@/lib/uploadthing"
import { addAttachment, deleteAttachment } from "@/lib/actions/attachment.actions"
import { Paperclip, X } from "lucide-react"

interface Props {
  plan: {
    id: string
    title: string
    subject: string
    objectives: string
    activities: string
    assessment: string | null
    notes: string | null
    classId: string
    attachments: { id: string; name: string; url: string }[]
  }
  classes: { id: string; name: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLessonPlanDialog({ plan, classes, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: plan.title,
    subject: plan.subject,
    objectives: plan.objectives,
    activities: plan.activities,
    assessment: plan.assessment ?? "",
    notes: plan.notes ?? "",
    classId: plan.classId,
  })
  const [attachments, setAttachments] = useState(plan.attachments)
  const [uploadError, setUploadError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await updateLessonPlan(plan.id, form)
      onOpenChange(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAttachment(fileId: string) {
    await deleteAttachment(fileId)
    setAttachments((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Class</Label>
            <Select
              value={form.classId}
              onValueChange={(val) => setForm({ ...form, classId: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-objectives">Learning Objectives</Label>
            <Textarea
              id="edit-objectives"
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-activities">Activities</Label>
            <Textarea
              id="edit-activities"
              value={form.activities}
              onChange={(e) => setForm({ ...form, activities: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assessment">Assessment</Label>
            <Textarea
              id="edit-assessment"
              value={form.assessment}
              onChange={(e) => setForm({ ...form, assessment: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="space-y-2">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border rounded-md px-3 py-2"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline truncate"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteAttachment(file.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <UploadButton
              endpoint="attachmentUploader"
              appearance={{
                container: "w-full items-start",
                button:
                  "bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-md h-9 ut-uploading:cursor-not-allowed ut-uploading:opacity-50",
                allowedContent: "text-xs text-muted-foreground mt-1",
              }}
              content={{
                button: "Upload File",
                allowedContent: "PDF, Word, or Image — up to 16MB",
              }}
              onClientUploadComplete={async (res) => {
                setUploadError("")
                for (const file of res) {
                  await addAttachment({
                    url: file.ufsUrl,
                    name: file.name,
                    lessonPlanId: plan.id,
                  })
                  setAttachments((prev) => [
                    ...prev,
                    { id: file.key, name: file.name, url: file.ufsUrl },
                  ])
                }
              }}
              onUploadError={(uploadErr: Error) => {
                setUploadError(uploadErr.message)
              }}
            />
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}