"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div>
        <h3 className="text-sm font-medium">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message ?? "An unexpected error occurred"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}