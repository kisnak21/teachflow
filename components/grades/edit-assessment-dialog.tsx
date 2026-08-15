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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateAssessment } from '@/lib/actions/assessment.actions'

const types = ['QUIZ', 'EXAM', 'HOMEWORK', 'PRACTICE', 'OTHER'] as const

interface Props {
  assessment: {
    id: string
    title: string
    type: string
    maxScore: number
    weight: number | null
    date: Date | string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssessmentDialog({
  assessment,
  open,
  onOpenChange,
}: Props) {
  const [form, setForm] = useState({
    title: assessment.title,
    type: assessment.type,
    maxScore: String(assessment.maxScore),
    weight: assessment.weight !== null ? String(assessment.weight) : '',
    date: assessment.date
      ? new Date(assessment.date).toISOString().slice(0, 10)
      : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await updateAssessment(assessment.id, {
        title: form.title,
        type: form.type,
        maxScore: form.maxScore,
        weight: form.weight || null,
        date: form.date || null,
      })
      onOpenChange(false)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to update assessment'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Judul</Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxScore">Nilai Maksimum</Label>
              <Input
                id="edit-maxScore"
                type="number"
                min={1}
                max={1000}
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Bobot %</Label>
              <Input
                id="edit-weight"
                type="number"
                min={0}
                max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
