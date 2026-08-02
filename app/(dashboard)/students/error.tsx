"use client"

import ErrorBoundary from "@/components/error-boundary"

export default function Error(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary {...props} />
}
