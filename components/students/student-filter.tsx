"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  classes: { id: string; name: string }[]
  selectedClassId?: string
}

export function StudentFilter({ classes, selectedClassId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string) {
    if (value === "all") {
      router.push(pathname)
    } else {
      router.push(`${pathname}?classId=${value}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Filter by class:</span>
      <Select
        value={selectedClassId ?? "all"}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All classes</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}