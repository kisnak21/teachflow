import { getClasses } from '@/lib/actions/class.actions'
import { getGradebook } from '@/lib/actions/assessment.actions'
import { Gradebook } from '@/components/grades/gradebook'
import { Trophy } from 'lucide-react'

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const params = await searchParams
  const classes = await getClasses()

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Buku Nilai</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap nilai otomatis per kelas — assessment & nilai siswa
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">Belum ada kelas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Buat kelas dulu sebelum mengelola nilai
          </p>
        </div>
      </div>
    )
  }

  const selectedClassId = params.classId ?? classes[0].id
  const gradebook = await getGradebook(selectedClassId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Buku Nilai</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola assessment & nilai siswa — rata-rata otomatis & rapor
        </p>
      </div>

      <Gradebook
        classes={classes}
        initial={gradebook}
        selectedClassId={selectedClassId}
      />
    </div>
  )
}
