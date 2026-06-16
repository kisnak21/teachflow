"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  levels: string[]
  selectedLevel?: string
}

export function ClassFilter({ levels, selectedLevel }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleFilter(level: string | null) {
    if (!level) {
      router.push(pathname)
    } else {
      router.push(`${pathname}?level=${level}`)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filter by level:</span>
      <Button
        variant={!selectedLevel ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilter(null)}
      >
        All
      </Button>
      {levels.map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(level)}
        >
          {level}
        </Button>
      ))}
    </div>
  )
}