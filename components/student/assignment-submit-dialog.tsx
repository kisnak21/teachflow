'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { UploadButton } from '@/lib/uploadthing'
import { Paperclip, Trash2, Loader2 } from 'lucide-react'
import {
  deleteSubmission,
  submitAssignment,
} from '@/lib/actions/submission.actions'

interface Submission {
  id: string
  fileUrl: string
  fileName: string
  note: string | null
  score: number | null
  feedback: string | null
  submittedAt: Date
}

interface Props {
  assignmentId: string
  assignmentTitle: string
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignmentSubmitDialog({
  assignmentId,
  assignmentTitle,
  submission,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter()
  const [pendingFile, setPendingFile] = useState<{
    url: string
    name: string
  } | null>(null)
  const [note, setNote] = useState(submission?.note ?? '')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  async function handleSubmit() {
    if (!pendingFile) return
    setSubmitting(true)
    setError('')
    try {
      await submitAssignment({
        assignmentId,
        fileUrl: pendingFile.url,
        fileName: pendingFile.name,
        note: note.trim() || undefined,
      })
      onOpenChange(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!submission) return
    if (!confirm('Delete your submission? This cannot be undone.')) return
    setDeleting(true)
    setError('')
    try {
      await deleteSubmission(submission.id)
      onOpenChange(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const viewingSubmission = submission && !showForm && !pendingFile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{assignmentTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {viewingSubmission ? (
            <>
              <div className="border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      submission.score === null
                        ? 'text-yellow-600 border-yellow-600'
                        : 'text-green-600 border-green-600'
                    }
                  >
                    {submission.score === null ? 'Submitted' : 'Graded'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{submission.fileName}</span>
                </a>
                {submission.note && (
                  <p className="text-sm text-muted-foreground">
                    {submission.note}
                  </p>
                )}
              </div>

              {submission.score !== null && (
                <div className="border rounded-md p-3 space-y-2 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {submission.score}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  {submission.feedback && (
                    <p className="text-sm">{submission.feedback}</p>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive hover:text-destructive"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setShowForm(true)
                    setPendingFile(null)
                  }}
                >
                  Replace submission
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>File</Label>
                <UploadButton
                  endpoint="submissionUploader"
                  appearance={{
                    container: 'w-full items-start',
                    button:
                      'bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-md h-9 ut-uploading:cursor-not-allowed ut-uploading:opacity-50',
                    allowedContent: 'text-xs text-muted-foreground mt-1',
                  }}
                  content={{
                    button: 'Upload File',
                    allowedContent:
                      'PDF, Word, or Image — one file, up to 16MB',
                  }}
                  onClientUploadComplete={(res) => {
                    setUploadError('')
                    const file = res[0]
                    if (file) {
                      setPendingFile({ url: file.ufsUrl, name: file.name })
                    }
                  }}
                  onUploadError={(uploadErr: Error) => {
                    setUploadError(uploadErr.message)
                  }}
                />
                {pendingFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5" />
                    {pendingFile.name}
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="submit-note">Note (optional)</Label>
                <Textarea
                  id="submit-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. explanation about your work..."
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    setShowForm(false)
                    setPendingFile(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!pendingFile || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
