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
import { Checkbox } from "@/components/ui/checkbox"
import { updateAssignment } from "@/lib/actions/assignment.actions"

interface Props {
  assignment: {
    id: string
    title: string
    description: string | null
    dueDate: Date
    classes: {
      classId: string
      class: { id: string; name: string }
    }[]
  }
  classes: { id: string; name: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssignmentDialog({
  assignment,
  classes,
  open,
  onOpenChange,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: assignment.title,
    description: assignment.description ?? "",
    dueDate: new Date(assignment.dueDate).toISOString().split("T")[0],
    classIds: assignment.classes.map((ac) => ac.classId),
  })

  function toggleClass(classId: string) {
    setForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }))
  }

  function toggleAll() {
    setForm((prev) => ({
      ...prev,
      classIds:
        prev.classIds.length === classes.length
          ? []
          : classes.map((c) => c.id),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await updateAssignment(assignment.id, form)
      onOpenChange(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const allSelected = form.classIds.length === classes.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Due Date</Label>
            <Input
              id="edit-dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Classes</Label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-class-${cls.id}`}
                    checked={form.classIds.includes(cls.id)}
                    onCheckedChange={() => toggleClass(cls.id)}
                  />
                  <label
                    htmlFor={`edit-class-${cls.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {cls.name}
                  </label>
                </div>
              ))}
            </div>
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