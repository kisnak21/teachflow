'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClass } from '@/lib/actions/class.actions'
import { createStudent } from '@/lib/actions/student.actions'
import {
  BookOpen,
  Users,
  Share2,
  Check,
  Copy,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

type CreatedClass = {
  id: string
  name: string
  level: string | null
  accessCode: string
}

const steps = [
  { label: 'Buat Kelas', icon: BookOpen },
  { label: 'Tambah Siswa', icon: Users },
  { label: 'Bagikan Kode', icon: Share2 },
]

export function OnboardingWizard({
  onComplete,
  onSkip,
}: {
  onComplete?: () => void
  onSkip?: () => void
}) {
  const [step, setStep] = useState(1)
  const [createdClass, setCreatedClass] = useState<CreatedClass | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Selamat datang di TeachFlow!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selesaikan 3 langkah ini untuk memulai mengajar.
          </p>
        </div>
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="shrink-0 text-muted-foreground"
          >
            Lewati
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon
          const active = step === i + 1
          const done = step > i + 1
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-sm ${active ? 'font-semibold' : done ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${done ? 'bg-primary' : 'bg-border'}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <StepCreateClass
          onCreated={(c) => {
            setCreatedClass(c)
            setStep(2)
          }}
        />
      )}
      {step === 2 && createdClass && (
        <StepAddStudents
          classId={createdClass.id}
          className={createdClass.name}
          onNext={() => setStep(3)}
          onSkip={() => setStep(3)}
        />
      )}
      {step === 3 && createdClass && (
        <StepShareCode
          createdClass={createdClass}
          onDone={() => onComplete?.()}
        />
      )}
    </div>
  )
}

function StepCreateClass({
  onCreated,
}: {
  onCreated: (c: CreatedClass) => void
}) {
  const [form, setForm] = useState({ name: '', level: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const created = await createClass({ name: form.name, level: form.level })
      if (!created) throw new Error('Failed to create class')
      onCreated(created as CreatedClass)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Langkah 1 — Buat Kelas</CardTitle>
        <CardDescription>
          Buat kelas pertama Anda. Anda bisa menambah kelas lain nanti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ob-level">Tingkat</Label>
            <Input
              id="ob-level"
              placeholder="mis. XI atau Kelas 5"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ob-name">Nama Kelas</Label>
            <Input
              id="ob-name"
              placeholder="mis. RPL A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Membuat...' : 'Buat Kelas'}{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function StepAddStudents({
  classId,
  className,
  onNext,
  onSkip,
}: {
  classId: string
  className: string
  onNext: () => void
  onSkip: () => void
}) {
  const [form, setForm] = useState({ name: '', studentNumber: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState<{ name: string; studentNumber: string }[]>(
    []
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createStudent({
        name: form.name,
        studentNumber: form.studentNumber,
        classId,
      })
      setAdded((prev) => [
        ...prev,
        { name: form.name, studentNumber: form.studentNumber },
      ])
      setForm({ name: '', studentNumber: '' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Langkah 2 — Tambah Siswa ke {className}
        </CardTitle>
        <CardDescription>
          Tambahkan minimal satu siswa. Anda juga bisa import Excel nanti di
          halaman Students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="ob-sname">Nama Siswa</Label>
            <Input
              id="ob-sname"
              placeholder="Nama lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="ob-snum">NIS / No. Siswa</Label>
            <Input
              id="ob-snum"
              placeholder="mis. 12345"
              value={form.studentNumber}
              onChange={(e) =>
                setForm({ ...form, studentNumber: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? 'Menambah...' : 'Tambah'}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {added.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {added.map((s) => (
              <Badge key={s.studentNumber} variant="secondary">
                {s.name} • {s.studentNumber}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onSkip}>
            Lewati
          </Button>
          <Button onClick={onNext} disabled={added.length === 0}>
            Lanjut <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StepShareCode({
  createdClass,
  onDone,
}: {
  createdClass: CreatedClass
  onDone: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(createdClass.accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Langkah 3 — Bagikan Kode Akses
        </CardTitle>
        <CardDescription>
          Berikan kode ini ke siswa agar mereka bisa login di halaman Student
          Login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/30 px-6 py-6">
          <span className="font-mono text-3xl font-bold tracking-widest">
            {createdClass.accessCode}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copy"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Kelas{' '}
          <span className="font-medium text-foreground">
            {createdClass.name}
          </span>
          {createdClass.level ? ` — ${createdClass.level}` : ''} • Minta siswa
          login dengan NIS + kode di atas
        </p>
        <div className="flex justify-end">
          <Button onClick={onDone}>
            Selesai — ke Dashboard <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
