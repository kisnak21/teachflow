'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { AssignmentSubmitDialog } from './assignment-submit-dialog'

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
}

export function AssignmentSubmitButton({
  assignmentId,
  assignmentTitle,
  submission,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        {submission ? (
          <Badge
            variant="outline"
            className={
              submission.score !== null
                ? 'text-green-600 border-green-600'
                : 'text-yellow-600 border-yellow-600'
            }
          >
            {submission.score !== null ? 'Graded' : 'Submitted'}
          </Badge>
        ) : (
          <Badge variant="secondary">Not submitted</Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(true)}
          title={submission ? 'View submission' : 'Submit work'}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <AssignmentSubmitDialog
        key={submission?.id ?? 'none'}
        assignmentId={assignmentId}
        assignmentTitle={assignmentTitle}
        submission={submission}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
