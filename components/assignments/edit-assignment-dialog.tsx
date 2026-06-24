'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { updateAssignment } from '@/lib/actions/assignment.actions'
import { UploadButton } from '@/lib/uploadthing'
import {
  addAttachment,
  deleteAttachment,
} from '@/lib/actions/attachment.actions'
import { Paperclip, X } from 'lucide-react'

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
    attachments: { id: string; name: string; url: string }[]
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
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: assignment.title,
    description: assignment.description ?? '',
    dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
    classIds: assignment.classes.map((ac) => ac.classId),
  })
  const [attachments, setAttachments] = useState(assignment.attachments)
  const [uploadError, setUploadError] = useState('')

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
        prev.classIds.length === classes.length ? [] : classes.map((c) => c.id),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateAssignment(assignment.id, form)
      onOpenChange(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAttachment(fileId: string) {
    await deleteAttachment(fileId)
    setAttachments((prev) => prev.filter((f) => f.id !== fileId))
  }

  const allSelected = form.classIds.length === classes.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                {allSelected ? 'Deselect all' : 'Select all'}
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
                container: 'w-full items-start',
                button:
                  'bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-md h-9 ut-uploading:cursor-not-allowed ut-uploading:opacity-50',
                allowedContent: 'text-xs text-muted-foreground mt-1',
              }}
              content={{
                button: 'Upload File',
                allowedContent: 'PDF, Word, or Image — up to 16MB',
              }}
              onClientUploadComplete={async (res) => {
                setUploadError('')
                for (const file of res) {
                  await addAttachment({
                    url: file.ufsUrl,
                    name: file.name,
                    assignmentId: assignment.id,
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
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
