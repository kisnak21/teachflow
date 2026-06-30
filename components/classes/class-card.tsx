'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Pencil, Trash2, Copy, Check } from 'lucide-react'
import { deleteClass } from '@/lib/actions/class.actions'
import { EditClassDialog } from './edit-class-dialog'

interface ClassCardProps {
  cls: {
    id: string
    name: string
    level: string | null
    accessCode: string
    _count: { students: number }
  }
}

export function ClassCard({ cls }: ClassCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${cls.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteClass(cls.id)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(cls.accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{cls.name}</CardTitle>
            {cls.level && <Badge variant="secondary">{cls.level}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{cls._count.students} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Student Access Code
              </p>
              <p className="text-xs font-mono font-medium truncate max-w-40">
                {cls.accessCode}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditClassDialog cls={cls} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
